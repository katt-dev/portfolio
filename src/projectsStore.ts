// ============================================================================
//   ХРАНИЛИЩЕ ПРОЕКТОВ (служебный файл — трогать не нужно)
//
//   На опубликованном сайте проекты ВСЕГДА берутся из settings.ts.
//
//   Черновики редактора (localStorage) читаются и пишутся только при
//   локальном запуске npm run dev. Поэтому посетитель сайта не может
//   ничего сохранить или подменить даже у себя в браузере, а ты не
//   рискуешь увидеть на сайте случайный черновик вместо настоящих данных.
//
//   Чтобы правки попали на сайт — в редакторе нажми
//   «Скопировать код для settings.ts» и вставь их в settings.ts.
// ============================================================================

import {
  PROJECTS, STATUS_ORDER,
  type Project, type ProjectImage, type ProjectStatus, type TeamMember, type TextPair,
} from "./settings";

export const STORAGE_KEY = "katt.projects.v1";

// Черновики доступны только при локальной разработке.
const DRAFTS_ENABLED = import.meta.env.DEV;

// ---------------------------------------------------------------------------
//  Нормализация — чтобы кривой/старый JSON не уронил сайт
// ---------------------------------------------------------------------------

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const pair = (v: unknown): TextPair => {
  const o = (v ?? {}) as Partial<TextPair>;
  return { ru: str(o.ru), en: str(o.en) };
};

const status = (v: unknown): ProjectStatus =>
  (STATUS_ORDER as readonly string[]).includes(str(v)) ? (v as ProjectStatus) : "";

const image = (v: unknown): ProjectImage => {
  const o = (v ?? {}) as Partial<ProjectImage>;
  return { src: str(o.src), caption: pair(o.caption) };
};

const member = (v: unknown): TeamMember => {
  const o = (v ?? {}) as Partial<TeamMember>;
  return { name: str(o.name), role: pair(o.role), avatar: str(o.avatar), email: str(o.email) };
};

export function normalizeProject(v: unknown): Project {
  const o = (v ?? {}) as Partial<Project>;
  return {
    id: str(o.id) || `project-${Math.random().toString(36).slice(2, 8)}`,
    num: str(o.num),
    year: str(o.year),
    engine: str(o.engine),
    status: status(o.status),
    tags: Array.isArray(o.tags) ? o.tags.filter((t): t is string => typeof t === "string") : [],
    cover: str(o.cover),
    title: pair(o.title),
    subtitle: pair(o.subtitle),
    description: pair(o.description),
    myRole: pair(o.myRole),
    linkUrl: str(o.linkUrl),
    linkLabel: pair(o.linkLabel),
    images: Array.isArray(o.images) ? o.images.map(image) : [],
    team: Array.isArray(o.team) ? o.team.map(member) : [],
  };
}

export const normalizeProjects = (v: unknown): Project[] =>
  Array.isArray(v) ? v.map(normalizeProject) : [];

// ---------------------------------------------------------------------------
//  Чтение / запись
// ---------------------------------------------------------------------------

/** Проекты из settings.ts, приведённые к правильной форме. */
export const defaultProjects = (): Project[] => normalizeProjects(PROJECTS);

/** Что показывать на сайте прямо сейчас. */
export function loadProjects(): Project[] {
  if (!DRAFTS_ENABLED) return defaultProjects();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProjects();
    const parsed = normalizeProjects(JSON.parse(raw));
    // Пустой массив — это осмысленное состояние («я удалил все проекты»),
    // поэтому возвращаем его как есть, а не подменяем дефолтом.
    return parsed;
  } catch {
    return defaultProjects();
  }
}

export function saveProjects(projects: Project[]): { ok: true } | { ok: false; error: string } {
  if (!DRAFTS_ENABLED) return { ok: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return { ok: true };
  } catch (e) {
    // Чаще всего это переполнение localStorage вставленными картинками.
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function clearProjects() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function makeEmptyProject(index: number, title: string): Project {
  return normalizeProject({
    id: `project-${Date.now().toString(36)}`,
    num: String(index + 1).padStart(2, "0"),
    year: String(new Date().getFullYear()),
    engine: "",
    status: "concept",
    tags: [],
    cover: "",
    title: { ru: title, en: title },
    subtitle: { ru: "", en: "" },
    description: { ru: "", en: "" },
    myRole: { ru: "", en: "" },
    linkUrl: "",
    linkLabel: { ru: "", en: "" },
    images: [],
    team: [],
  });
}

// ---------------------------------------------------------------------------
//  Экспорт — код, который вставляется в settings.ts
// ---------------------------------------------------------------------------

const q = (s: string) => JSON.stringify(s);
const p = (t: TextPair) => `{ ru: ${q(t.ru)}, en: ${q(t.en)} }`;

/** Готовый блок `export const PROJECTS ...` для вставки в settings.ts. */
export function toSettingsCode(projects: Project[]): string {
  const body = projects.map((x) => `  {
    id: ${q(x.id)},
    num: ${q(x.num)},
    year: ${q(x.year)},
    engine: ${q(x.engine)},
    status: ${q(x.status)},
    tags: [${x.tags.map(q).join(", ")}],
    cover: ${q(x.cover)},
    title:       ${p(x.title)},
    subtitle:    ${p(x.subtitle)},
    description: ${p(x.description)},
    myRole:      ${p(x.myRole)},
    linkUrl:     ${q(x.linkUrl)},
    linkLabel:   ${p(x.linkLabel)},
    images: [
${x.images.map((i) => `      { src: ${q(i.src)}, caption: ${p(i.caption)} },`).join("\n")}
    ],
    team: [
${x.team.map((m) => `      { name: ${q(m.name)}, role: ${p(m.role)}, avatar: ${q(m.avatar)}, email: ${q(m.email ?? "")} },`).join("\n")}
    ],
  },`).join("\n");

  return `export const PROJECTS: Project[] = [\n${body}\n];\n`;
}

export const toJson = (projects: Project[]): string => JSON.stringify(projects, null, 2);

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------------
//  Картинки: файл / вставка из буфера -> сжатый data-URL
//
//  Скриншоты ужимаются до MAX_SIDE по большей стороне и пережимаются в
//  WebP/JPEG, иначе localStorage переполняется на втором же скриншоте.
// ---------------------------------------------------------------------------

const MAX_SIDE = 1600;
const QUALITY = 0.82;

export function isImageFile(f: File | null | undefined): f is File {
  return !!f && f.type.startsWith("image/");
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/** Читает файл-картинку и возвращает сжатый data-URL. */
export async function imageFileToDataUrl(file: File): Promise<string> {
  const raw = await fileToDataUrl(file);

  // SVG и гифки не пережимаем — потеряем анимацию/векторность.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return raw;

  try {
    const img = await loadImage(raw);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);

    const webp = canvas.toDataURL("image/webp", QUALITY);
    const out = webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", QUALITY);
    return out.length < raw.length ? out : raw;
  } catch {
    return raw;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

/** Достаёт картинки из события вставки (Ctrl+V) или перетаскивания. */
export function imagesFromTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  const out: File[] = [];
  if (dt.files && dt.files.length) {
    for (const f of Array.from(dt.files)) if (isImageFile(f)) out.push(f);
  }
  if (!out.length && dt.items) {
    for (const item of Array.from(dt.items)) {
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (isImageFile(f)) out.push(f);
      }
    }
  }
  return out;
}

/** Ссылка на картинку, если вместо файла вставили просто URL текстом. */
export function urlFromTransfer(dt: DataTransfer | null): string {
  const text = dt?.getData("text/plain")?.trim() ?? "";
  return /^https?:\/\/\S+$/i.test(text) || text.startsWith("data:image/") ? text : "";
}
