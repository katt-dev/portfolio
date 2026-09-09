// ============================================================================
//   ХРАНИЛИЩЕ ТЕКСТОВ САЙТА (служебный файл — трогать не нужно)
//
//   Работает точно так же, как projectsStore:
//     • обычный посетитель видит тексты из src/content.json;
//     • черновики редактора живут в localStorage и только у тебя;
//     • кнопка «Опубликовать» записывает content.json в репозиторий.
// ============================================================================

import contentData from "./content.json";
import type { Lang } from "./settings";
import { isAdminUnlocked } from "./adminAccess";

export const CONTENT_KEY = "katt.content.v1";

/** Тексты одного языка. Ключи берутся из content.json — они там все. */
export type UiBlock = (typeof contentData)["ui"]["ru"];

export interface SiteContent {
  name: string;
  email: string;
  discord: string;
  badge: string;
  portrait: string;
  ui: Record<Lang, UiBlock>;
}

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** Приводим к правильной форме: недостающие ключи берём из content.json. */
export function normalizeContent(v: unknown): SiteContent {
  const base = contentData as unknown as SiteContent;
  const o = (v ?? {}) as Partial<SiteContent>;

  const block = (lang: Lang): UiBlock => {
    const src = (o.ui?.[lang] ?? {}) as Record<string, unknown>;
    const def = base.ui[lang] as unknown as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(def)) {
      const d = def[key];
      // about — это список абзацев, остальное обычные строки
      if (Array.isArray(d)) {
        const got = src[key];
        out[key] = Array.isArray(got) ? got.map((x) => str(x)) : d;
      } else {
        out[key] = str(src[key], String(d));
      }
    }
    return out as UiBlock;
  };

  return {
    name: str(o.name, base.name),
    email: str(o.email, base.email),
    discord: str(o.discord, base.discord),
    badge: str(o.badge, base.badge),
    portrait: str(o.portrait, base.portrait),
    ui: { ru: block("ru"), en: block("en") },
  };
}

/** Тексты из content.json — то, что видят посетители. */
export const defaultContent = (): SiteContent =>
  normalizeContent(contentData);

/** Что показывать прямо сейчас. */
export function loadContent(): SiteContent {
  if (!isAdminUnlocked()) return defaultContent();
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return defaultContent();
    return normalizeContent(JSON.parse(raw));
  } catch {
    return defaultContent();
  }
}

export function saveContent(content: SiteContent): { ok: boolean } {
  if (!isAdminUnlocked()) return { ok: true };
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function clearContent() {
  try { localStorage.removeItem(CONTENT_KEY); } catch { /* ignore */ }
}

export const contentToJson = (c: SiteContent): string =>
  JSON.stringify(c, null, 2) + "\n";

/**
 * Понятные подписи полей для редактора. Ключи, которых тут нет,
 * всё равно покажутся — просто с техническим именем.
 */
export const FIELD_LABELS: Record<string, { ru: string; en: string }> = {
  firstName:   { ru: "Имя (крупно на главной)",     en: "First name (hero)" },
  lastName:    { ru: "Фамилия (вторая строка)",     en: "Last name (second line)" },
  logo:        { ru: "Логотип в шапке",             en: "Header logo" },
  location:    { ru: "Подпись на портрете",         en: "Caption on the portrait" },
  heroBio:     { ru: "Строка под именем",           en: "Line under the name" },
  about:       { ru: "Обо мне (абзацы)",            en: "About (paragraphs)" },
  navProjects: { ru: "Меню: Проекты",               en: "Menu: Work" },
  navAbout:    { ru: "Меню: Обо мне",               en: "Menu: About" },
  navContact:  { ru: "Меню: Контакты",              en: "Menu: Contact" },
  viewWork:    { ru: "Кнопка «Смотреть проекты»",   en: "Button: view projects" },
  writeMe:     { ru: "Кнопка «Написать»",           en: "Button: write me" },
  featured:    { ru: "Заголовок раздела проектов",  en: "Projects section title" },
  clickHint:   { ru: "Подсказка у проектов",        en: "Hint near projects" },
  aboutTitle:  { ru: "Заголовок «Обо мне»",         en: "About title" },
  aboutSub:    { ru: "Подзаголовок «Обо мне»",      en: "About subtitle" },
  tabTitle:    { ru: "Название вкладки браузера",   en: "Browser tab title" },
  contactTitle:{ ru: "Заголовок «Контакты»",        en: "Contact title" },
  contactMe:   { ru: "Подзаголовок контактов",      en: "Contact subtitle" },
  contactNote: { ru: "Текст под контактами",        en: "Text under contacts" },
  handmade:    { ru: "Правая надпись в подвале",    en: "Footer right text" },
  teamLabel:   { ru: "«Команда проекта»",           en: "Project team label" },
  roleLabel:   { ru: "«Моя роль»",                  en: "My role label" },
  statusLabel: { ru: "«Стадия»",                    en: "Stage label" },
  mailBtn:     { ru: "Кнопка «Написать руководителю»", en: "Email lead button" },
  settings:    { ru: "Заголовок настроек",          en: "Settings title" },
  language:    { ru: "«Язык сайта»",                en: "Site language label" },
  langHint:    { ru: "Подсказка про язык",          en: "Language hint" },
  close:       { ru: "«Закрыть»",                   en: "Close" },
  themeAria:   { ru: "Подпись кнопки темы",         en: "Theme button label" },
  settingsAria:{ ru: "Подпись кнопки настроек",     en: "Settings button label" },
  editorBtn:   { ru: "Кнопка редактора",            en: "Editor button" },
};
