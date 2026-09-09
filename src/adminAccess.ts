// ============================================================================
//   ДОСТУП К РЕДАКТОРУ (служебный файл)
//
//   Как это работает:
//     1) Один раз заходишь по секретному адресу (см. ADMIN_SECRET в settings.ts):
//            https://ka1tt.github.io/portfolio/#твой-секрет
//     2) Браузер это запоминает НАВСЕГДА (пока не почистишь данные сайта).
//     3) Дальше просто открываешь сайт как обычно — в меню-шестерёнке
//        появляется кнопка «Редактор проектов», плюс работает Ctrl+Shift+E.
//
//   Секрет из адресной строки сразу стирается, чтобы не остался в истории
//   браузера и не попал случайно в скриншот.
//
//   Выключить доступ на этом браузере:  открыть сайт с  #exit
// ============================================================================

import { ADMIN_SECRET } from "./settings";

const FLAG = "katt.admin.v1";

/** Узнан ли хозяин сайта на этом браузере. */
export function isAdminUnlocked(): boolean {
  if (import.meta.env.DEV) return true; // при npm run dev — всегда да
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

function setFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(FLAG, "1");
    else localStorage.removeItem(FLAG);
  } catch { /* приватный режим — просто игнорируем */ }
}

/** Убирает #секрет из адресной строки, не перезагружая страницу. */
function stripHash() {
  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch { /* ignore */ }
}

/**
 * Проверяет адрес при загрузке страницы.
 * Возвращает: узнан ли хозяин, и надо ли сразу открыть редактор.
 */
export function checkAccessFromUrl(): { unlocked: boolean; openEditor: boolean } {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, "")).trim().toLowerCase();

  if (hash === "exit") {
    setFlag(false);
    stripHash();
    return { unlocked: false, openEditor: false };
  }

  const secret = ADMIN_SECRET.trim().toLowerCase();
  if (secret && hash === secret) {
    setFlag(true);
    stripHash(); // секрет не остаётся в адресной строке
    return { unlocked: true, openEditor: true };
  }

  return { unlocked: isAdminUnlocked(), openEditor: false };
}
