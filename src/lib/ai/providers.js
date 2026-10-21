// Server-only. Sends one chat request to the first LLM that answers.
// Every provider here speaks the OpenAI chat-completions format, so one code path covers all of them.

export class AiUnavailableError extends Error {
  constructor(message, failures = []) {
    super(message);
    this.name = 'AiUnavailableError';
    this.failures = failures;
  }
}

const CATALOG = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    prefix: 'GROQ',
    defaultModels: 'llama-3.3-70b-versatile,llama-3.1-8b-instant',
    json: true,
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    prefix: 'GEMINI',
    defaultModels: 'gemini-2.5-flash',
    json: true,
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    prefix: 'OPENROUTER',
    defaultModels: 'meta-llama/llama-3.3-70b-instruct:free',
    json: false, // not every OpenRouter model supports JSON mode; the prompt + parser handle it
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    prefix: 'CEREBRAS',
    defaultModels: '', // set CEREBRAS_MODELS yourself
    json: true,
  },
};

const list = (v) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Every (provider, model, key) combination that is configured, in the order it should be tried. */
function buildCandidates() {
  const order = list(process.env.AI_PROVIDER_ORDER || 'groq,gemini,openrouter,cerebras');
  const out = [];
  for (const name of order) {
    const p = CATALOG[name];
    if (!p) continue;
    const keys = list(process.env[`${p.prefix}_API_KEYS`] || process.env[`${p.prefix}_API_KEY`]);
    const models = list(process.env[`${p.prefix}_MODELS`] || process.env[`${p.prefix}_MODEL`] || p.defaultModels);
    for (const model of models) {
      keys.forEach((key, i) => {
        out.push({ id: `${name}:${model}:${i}`, provider: name, model, key, url: p.url, json: p.json });
      });
    }
  }
  return out;
}

// Candidates that just failed are skipped for a while (per server instance).
const cooldown = new Map();

function coolDown(id, err) {
  const s = err.status;
  let ms = 0;
  if (s === 429) ms = Math.min((err.retryAfter ?? 60) * 1000, 10 * 60 * 1000);
  else if (s === 401 || s === 403 || s === 404) ms = 10 * 60 * 1000; // bad key or retired model
  else if (s === 0 || s >= 500) ms = 20 * 1000;
  if (ms) cooldown.set(id, Date.now() + ms);
}

async function callOne(c, { system, user, maxTokens, timeoutMs }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(c.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.key}` },
      body: JSON.stringify({
        model: c.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
        ...(c.json && { response_format: { type: 'json_object' } }),
      }),
      signal: ctrl.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
      err.status = res.status;
      err.retryAfter = Number(res.headers.get('retry-after')) || null;
      throw err;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response');
    return text;
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Timed out');
      err.status = 0;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Tries each configured model until one returns text that `parse` accepts.
 * A parse failure counts as a failure, so a model that rambles instead of returning JSON is skipped too.
 */
export async function runWithFallback({ system, user, maxTokens = 1800, parse, totalTimeoutMs = 50_000 }) {
  const all = buildCandidates();
  if (!all.length) throw new AiUnavailableError('No AI provider is configured. Add GROQ_API_KEY to your environment.');

  const started = Date.now();
  let usable = all.filter((c) => (cooldown.get(c.id) ?? 0) <= started);
  if (!usable.length) usable = all; // everything is cooling down: try anyway rather than fail instantly

  const failures = [];
  for (const c of usable) {
    const remaining = totalTimeoutMs - (Date.now() - started);
    if (remaining < 3000) break;
    try {
      const text = await callOne(c, { system, user, maxTokens, timeoutMs: Math.min(25_000, remaining) });
      const value = parse(text);
      return { value, provider: c.provider, model: c.model, fallbacks: failures.length, latencyMs: Date.now() - started };
    } catch (err) {
      coolDown(c.id, err);
      failures.push({ provider: c.provider, model: c.model, status: err.status ?? null, message: String(err.message).slice(0, 200) });
      console.warn(`[ai] ${c.provider}/${c.model} failed: ${err.message}`);
    }
  }
  throw new AiUnavailableError('All AI providers failed.', failures);
}