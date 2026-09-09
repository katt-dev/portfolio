// ============================================================================
//   ПУБЛИКАЦИЯ НА САЙТ
//
//   Редактор коммитит файл  src/projects.json  прямо в твой репозиторий
//   через GitHub API. После этого GitHub Actions сам пересобирает сайт —
//   обычно через минуту-полторы изменения уже видны всем.
//
//   Токен хранится ТОЛЬКО в твоём браузере (localStorage) и никогда
//   не попадает в репозиторий и никуда не отправляется, кроме api.github.com.
//
//   Служебный файл — трогать не нужно.
// ============================================================================

import { GITHUB_REPO, GITHUB_BRANCH, PROJECTS_PATH } from "../settings";

const TOKEN_KEY = "katt.gh.token";
const API = "https://api.github.com";

// ---------------------------------------------------------------------------
//  Токен
// ---------------------------------------------------------------------------

export function getToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) ?? ""; } catch { return ""; }
}

export function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* приватный режим */ }
}

/** Показываем токен как ghp_••••abcd — чтобы было видно, что он есть. */
export function maskToken(token: string): string {
  if (!token) return "";
  if (token.length <= 8) return "••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

// ---------------------------------------------------------------------------
//  Вспомогательное
// ---------------------------------------------------------------------------

/** base64 для UTF-8 (btoa сам по себе ломается на кириллице). */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export interface PublishResult {
  ok: boolean;
  /** Понятное человеку сообщение (уже на нужном языке). */
  message: string;
  /** Ссылка на коммит — если получилось. */
  commitUrl?: string;
}

type Lang = "ru" | "en";

const say = (lang: Lang, ru: string, en: string) => (lang === "ru" ? ru : en);

// ---------------------------------------------------------------------------
//  Публикация
// ---------------------------------------------------------------------------

/**
 * Записывает projects.json в репозиторий одним коммитом.
 * Возвращает понятное сообщение вместо того, чтобы бросать исключение.
 */
export async function publishProjects(
  json: string,
  token: string,
  lang: Lang,
): Promise<PublishResult> {
  if (!token) {
    return { ok: false, message: say(lang, "Сначала вставь токен GitHub.", "Paste your GitHub token first.") };
  }
  if (!GITHUB_REPO.includes("/")) {
    return {
      ok: false,
      message: say(lang,
        'В settings.ts неверно указан GITHUB_REPO. Нужен вид "имя/репозиторий".',
        'GITHUB_REPO in settings.ts is malformed. It must look like "owner/repo".'),
    };
  }

  const url = `${API}/repos/${GITHUB_REPO}/contents/${PROJECTS_PATH}`;

  try {
    // 1) Узнаём sha текущего файла — без него GitHub не даст его перезаписать.
    let sha: string | undefined;
    const head = await fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
      headers: headers(token),
    });

    if (head.status === 401) {
      return { ok: false, message: say(lang,
        "Токен не подошёл (401). Проверь, что скопировал его целиком и он не истёк.",
        "Token rejected (401). Check that you copied it fully and it has not expired.") };
    }
    if (head.status === 403) {
      return { ok: false, message: say(lang,
        "Нет прав (403). У токена должно быть разрешение Contents: Read and write для этого репозитория.",
        "Forbidden (403). The token needs Contents: Read and write permission for this repository.") };
    }
    if (head.ok) {
      const data = await head.json();
      sha = data.sha;
    } else if (head.status !== 404) {
      return { ok: false, message: say(lang,
        `GitHub ответил ошибкой ${head.status} при чтении файла.`,
        `GitHub returned ${head.status} while reading the file.`) };
    }
    // 404 = файла ещё нет, создадим новый — это нормально.

    // 2) Пишем файл.
    const res = await fetch(url, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({
        message: "content: обновление проектов из редактора",
        content: toBase64(json),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (res.status === 409) {
      return { ok: false, message: say(lang,
        "Файл успели изменить с другого устройства. Обнови страницу и опубликуй заново.",
        "The file changed elsewhere. Reload the page and publish again.") };
    }
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json())?.message ?? ""; } catch { /* ignore */ }
      return { ok: false, message: say(lang,
        `Не удалось опубликовать (${res.status}). ${detail}`,
        `Publish failed (${res.status}). ${detail}`) };
    }

    const out = await res.json();
    return {
      ok: true,
      commitUrl: out?.commit?.html_url,
      message: say(lang,
        "Опубликовано. GitHub пересобирает сайт — обычно занимает 1–2 минуты.",
        "Published. GitHub is rebuilding the site — usually 1–2 minutes."),
    };
  } catch {
    return { ok: false, message: say(lang,
      "Нет связи с GitHub. Проверь интернет и попробуй ещё раз.",
      "Could not reach GitHub. Check your connection and try again.") };
  }
}

/** Ссылка на вкладку Actions — чтобы посмотреть, как идёт пересборка. */
export const actionsUrl = () => `https://github.com/${GITHUB_REPO}/actions`;
