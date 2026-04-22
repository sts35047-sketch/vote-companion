const KEY = "first-vote-session-id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "fv_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

const PROGRESS_KEY = "first-vote-progress";
const COMPLETED_KEY = "first-vote-completed";
const STARTED_KEY = "first-vote-started-at";

export function getLocalProgress(): number {
  if (typeof window === "undefined") return 1;
  const v = parseInt(localStorage.getItem(PROGRESS_KEY) || "1", 10);
  return Number.isFinite(v) && v >= 1 ? v : 1;
}
export function setLocalProgress(step: number) {
  localStorage.setItem(PROGRESS_KEY, String(step));
  if (!localStorage.getItem(STARTED_KEY)) {
    localStorage.setItem(STARTED_KEY, String(Date.now()));
  }
}
export function markCompleted() {
  localStorage.setItem(COMPLETED_KEY, "1");
  if (!localStorage.getItem("first-vote-completed-at")) {
    localStorage.setItem("first-vote-completed-at", String(Date.now()));
  }
}
export function isCompleted(): boolean {
  return localStorage.getItem(COMPLETED_KEY) === "1";
}
export function getElapsedMinutes(): number {
  const started = parseInt(localStorage.getItem(STARTED_KEY) || "0", 10);
  const ended = parseInt(localStorage.getItem("first-vote-completed-at") || String(Date.now()), 10);
  if (!started) return 0;
  return Math.max(1, Math.round((ended - started) / 60000));
}
