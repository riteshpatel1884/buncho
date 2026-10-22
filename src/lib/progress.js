// Tiny client-side store that counts "things in flight" (navigations, server actions, API calls).
// RouteProgress subscribes to it and shows the top loading bar while the count is above zero.

let count = 0;
let navActive = false;
let navTimer = null;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l());

export const progress = {
  subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  isBusy() {
    return count > 0;
  },
  start() {
    count += 1;
    emit();
  },
  done() {
    count = Math.max(0, count - 1);
    emit();
  },
  // A page navigation counts once, and ends when the URL changes (or after a safety timeout).
  startNav() {
    if (navActive) return;
    navActive = true;
    progress.start();
    navTimer = setTimeout(progress.endNav, 10000);
  },
  endNav() {
    if (!navActive) return;
    navActive = false;
    clearTimeout(navTimer);
    progress.done();
  },
};