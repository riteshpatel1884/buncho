/** Asks the server to evaluate the signed-in user's saved answer. Never throws. */
export async function requestFeedback(problemId) {
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok) return { ok: true };
    return { ok: false, error: data?.error ?? 'AI feedback is unavailable right now.' };
  } catch {
    return { ok: false, error: 'Network error. Check your connection and try again.' };
  }
}