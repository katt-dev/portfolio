// Маршрут страницы проекта хранится в ?project=<id>: работает на любом статическом хостинге,
// ссылкой можно поделиться, кнопки «назад/вперёд» браузера работают.
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function read(): string | null {
  return new URLSearchParams(location.search).get('project');
}

let current = read();

window.addEventListener('popstate', () => {
  current = read();
  listeners.forEach((l) => l());
});

export function openProject(id: string | null, opts: { replace?: boolean } = {}) {
  if (id === current) return;
  const url = new URL(location.href);
  if (id) url.searchParams.set('project', id);
  else url.searchParams.delete('project');
  url.hash = '';
  const state = { project: id };
  if (opts.replace) history.replaceState(state, '', url);
  else history.pushState(state, '', url);
  current = id;
  listeners.forEach((l) => l());
}

/** Закрыть проект: если пришли с главной — шаг назад по истории, иначе заменить URL. */
export function closeProject() {
  if (history.state && 'project' in (history.state as object) && history.length > 1 && cameFromHome) {
    history.back();
  } else {
    openProject(null, { replace: true });
  }
}

let cameFromHome = false;
export function markCameFromHome() {
  cameFromHome = true;
}

export function useRoute(): string | null {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
  );
}

export function getRoute() {
  return current;
}
