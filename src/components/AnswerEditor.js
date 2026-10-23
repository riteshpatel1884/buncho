'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { saveSubmission } from '@/app/actions';
import { requestFeedback } from '@/lib/ai-client';
import { composeSteps, parseSteps } from '@/lib/steps';
import {
  CODE_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_KEY,
  commentPrefix,
  isLanguage,
  unwrapCode,
  wrapCode,
} from '@/lib/code-answer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MAX_ANSWER_LENGTH } from '@/lib/constants';
import { Mic, Stop } from './icons';
import Spinner from './Spinner';
import { Skeleton } from './Skeletons';

// The editor is browser-only, so it loads on demand with a placeholder
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="space-y-2 px-4 py-4" role="status">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <span className="sr-only">Loading editor…</span>
    </div>
  ),
});

const PLACEHOLDER = {
  python: '# Write your code here or explain your approach…',
};

const HINT = {
  python: 'Write code and explain your reasoning in # comments or """docstrings""". Dictated text is added as a # comment.',
};

// Works out the language and editor text from a saved answer
function buildInitial(content, stepList) {
  if (stepList) {
    const raw = parseSteps(content, stepList);
    const unwrapped = raw.map(unwrapCode);
    const hasText = raw.some((p) => p.trim());
    return {
      lang: DEFAULT_LANGUAGE,
      text: '',
      parts: raw.map((p, i) => (unwrapped[i] ? unwrapped[i].code : p)),
      hasContent: hasText,
    };
  }
  const text = String(content ?? '');
  const unwrapped = unwrapCode(text);
  if (unwrapped) return { lang: DEFAULT_LANGUAGE, text: unwrapped.code, parts: [], hasContent: true };
  // Python is the only editor language; older plain-text answers open in it unchanged
  return { lang: DEFAULT_LANGUAGE, text, parts: [], hasContent: Boolean(text.trim()) };
}

export default function AnswerEditor({ problemId, initialContent = '', hasSubmission = false, steps = null }) {
  const router = useRouter();
  const stepList = Array.isArray(steps) && steps.length ? steps : null;

  const [init] = useState(() => buildInitial(initialContent, stepList));
  const [codeLang, setCodeLang] = useState(init.lang);
  const [text, setText] = useState(init.text); // single-editor mode
  const [parts, setParts] = useState(init.parts); // step mode

  const compose = useCallback(
    (lang, t, p) => (stepList ? composeSteps(p.map((x) => wrapCode(x, lang)), stepList) : wrapCode(t, lang)),
    [stepList],
  );

  const [savedText, setSavedText] = useState(() => compose(init.lang, init.text, init.parts));
  const [active, setActive] = useState(0); // step that receives dictated text
  const activeRef = useRef(0);
  const langRef = useRef(codeLang);
  langRef.current = codeLang;
  const [everSaved, setEverSaved] = useState(hasSubmission);
  const [message, setMessage] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [pending, startTransition] = useTransition();

  // A fresh answer starts in the language the learner used last time
  useEffect(() => {
    if (init.hasContent) return;
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored && isLanguage(stored)) setCodeLang(stored);
    } catch {}
  }, [init.hasContent]);

  function changeLanguage(next) {
    setCodeLang(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {}
  }

  const content = compose(codeLang, text, parts);

  // Trims the text being edited so the stored answer (including code fences) stays under the limit
  const limitText = useCallback((value, lang) => {
    const over = wrapCode(value, lang).length - MAX_ANSWER_LENGTH;
    return over > 0 ? value.slice(0, Math.max(0, value.length - over)) : value;
  }, []);

  const fit = useCallback(
    (next, i) => {
      const over = compose(langRef.current, '', next).length - MAX_ANSWER_LENGTH;
      if (over > 0) next[i] = next[i].slice(0, Math.max(0, next[i].length - over));
      return next;
    },
    [compose],
  );

  // Dictated phrases go to the end of the answer (or of the focused step), as a comment in code languages
  const appendSpeech = useCallback(
    (chunk) => {
      const prefix = commentPrefix(langRef.current);
      const join = (prev) => {
        const base = prev.replace(/\s+$/, '');
        if (!prefix) return base ? `${base} ${chunk}` : chunk;
        return `${base ? `${base}\n` : ''}${prefix}${chunk}`;
      };
      if (stepList) {
        setParts((prev) => {
          const i = activeRef.current;
          const next = [...prev];
          next[i] = join(next[i] ?? '');
          return fit(next, i);
        });
      } else {
        setText((prev) => limitText(join(prev), langRef.current));
      }
    },
    [stepList, fit, limitText],
  );

  const { supported, listening, interim, error, start, stop } = useSpeechRecognition({
    lang: 'en-IN',
    onFinalText: appendSpeech,
  });

  const dirty = content !== savedText;

  function handleSave() {
    if (listening) stop();
    setMessage(null);
    startTransition(async () => {
      const res = await saveSubmission(problemId, content);
      if (!res.ok) {
        setMessage({ type: 'error', text: res.error });
        return;
      }

      setSavedText(content);
      setEverSaved(true);
      setMessage({ type: 'ok', text: 'Answer saved. Getting AI feedback…' });

      // Ask the server for AI feedback on the answer that was just saved
      setEvaluating(true);
      const fb = await requestFeedback(problemId);
      setEvaluating(false);

      if (fb.ok) {
        setMessage({ type: 'ok', text: 'Feedback is ready in the AI Feedback tab.' });
        window.dispatchEvent(new CustomEvent('buncho:open-tab', { detail: 'feedback' }));
      } else {
        setMessage({
          type: 'error',
          text: `Your answer is saved, but AI feedback failed: ${fb.error} You can retry from the AI Feedback tab.`,
        });
      }
      router.refresh();
    });
  }

  const status = dirty ? (everSaved ? 'Unsaved changes' : 'Draft') : everSaved ? 'Saved' : 'Empty';
  const selectCls = 'rounded-md bg-surface-2 px-2 py-1.5 text-sm text-ink disabled:opacity-50';

  return (
    <div className="flex min-h-[26rem] flex-[1_0_auto] flex-col">
      {/* Toolbar: dictation and code language */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line px-3 py-2">
        {supported ? (
          <>
            <button
              type="button"
              onClick={listening ? stop : start}
              aria-pressed={listening}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                listening ? 'bg-hard text-white' : 'bg-surface-2 text-ink hover:bg-line'
              }`}
            >
              {listening ? <Stop width={14} height={14} /> : <Mic width={14} height={14} />}
              {listening ? 'Stop dictating' : 'Dictate'}
            </button>
            {listening && (
              <span className="flex h-5 items-center gap-[3px]" aria-hidden="true">
                {[0, 0.15, 0.3, 0.1, 0.25].map((d, i) => (
                  <span key={i} className="wave-bar block h-4 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">Voice input isn&rsquo;t available in this browser. Chrome, Edge and Safari support it.</p>
        )}

        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="text-xs">Language</span>
          <select value={codeLang} onChange={(e) => changeLanguage(e.target.value)} className={selectCls}>
            {CODE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <span className="ml-auto text-xs text-muted">{status}</span>
      </div>

      {stepList ? (
        <div className="flex-1 space-y-5 px-4 py-4">
          {stepList.map((s, i) => (
            <div key={i}>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-semibold">
                  Step {i + 1} of {stepList.length}: {s.title}
                </span>
                {listening && active === i && <span className="text-xs font-medium text-hard">Voice goes here</span>}
              </p>
              <p className="mt-0.5 text-xs text-muted">{s.prompt}</p>
              <div className="mt-2 overflow-hidden rounded-lg border border-line">
                <CodeEditor
                  value={parts[i] ?? ''}
                  language={codeLang}
                  label={`Step ${i + 1}: ${s.title}`}
                  placeholder={PLACEHOLDER[codeLang]}
                  minHeight="7rem"
                  onFocus={() => {
                    activeRef.current = i;
                    setActive(i);
                  }}
                  onChange={(value) => setParts((prev) => fit(prev.map((p, j) => (j === i ? value : p)), i))}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-64 flex-1">
          <CodeEditor
            value={text}
            language={codeLang}
            label="Your answer"
            placeholder={PLACEHOLDER[codeLang]}
            minHeight="16rem"
            onChange={(value) => setText(limitText(value, codeLang))}
          />
        </div>
      )}

      <p className="shrink-0 border-t border-line px-4 py-2 text-xs text-muted">{HINT[codeLang]} Press Esc then Tab to leave the editor.</p>

      <div aria-live="polite" className="min-h-5 shrink-0 px-4 pb-1 text-xs italic text-muted">
        {listening && (interim ? `Listening… ${interim}` : 'Listening…')}
      </div>
      {error && (
        <p role="alert" className="shrink-0 px-4 pb-1 text-sm text-hard">
          {error}
        </p>
      )}

      {/* Bottom bar: counter on the left, Submit on the right */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <p className="text-xs text-muted">
          {content.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || (!dirty && everSaved)}
          aria-busy={pending}
          className="inline-flex items-center gap-2 rounded-md bg-go px-5 py-1.5 text-sm font-semibold text-go-ink transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
        >
          {pending && <Spinner size={14} />}
          {pending ? (evaluating ? 'Getting feedback…' : 'Saving…') : everSaved ? 'Save & re-evaluate' : 'Submit'}
        </button>
      </div>

      {/* Status message (saving, feedback ready, errors). Only rendered when there is something to say. */}
      {message && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <p role={message.type === 'error' ? 'alert' : 'status'} className={`text-sm ${message.type === 'error' ? 'text-hard' : 'text-easy'}`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}