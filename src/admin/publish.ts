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

import { GITHUB_REPO, GITHUB_BRANCH } from "../settings";

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

export interface FileToPublish {
  path: string;
  content: string;
}

/**
 * Записывает несколько файлов ОДНИМ коммитом (Git Data API).
 * Один коммит = одна пересборка сайта, а не две.
 *
 * Возвращает понятное сообщение вместо того, чтобы бросать исключение.
 */
export async function publishFiles(
  files: FileToPublish[],
  token: string,
  lang: Lang,
): Promise<PublishResult> {
  if (!token) {
    return { ok: false, message: say(lang, "Сначала вставь токен GitHub.", "Paste your GitHub token first.") };
  }
  if (!GITHUB_REPO.includes("/")) {
    return { ok: false, message: say(lang,
      'В settings.ts неверно указан GITHUB_REPO. Нужен вид "имя/репозиторий".',
      'GITHUB_REPO in settings.ts is malformed. It must look like "owner/repo".') };
  }

  const repo = `${API}/repos/${GITHUB_REPO}`;
  const h = headers(token);

  const fail = (status: number, detail = "") => ({
    ok: false as const,
    message: say(lang,
      `GitHub ответил ошибкой ${status}. ${detail}`,
      `GitHub returned ${status}. ${detail}`),
  });

  try {
    // 0) Проверяем доступ заранее — иначе GitHub отвечает невнятной 403/404.
    const probe = await fetch(repo, { headers: h });
    if (probe.status === 401) {
      return { ok: false, message: say(lang,
        "Токен не подошёл (401). Скорее всего скопирован не полностью или уже истёк — создай новый.",
        "Token rejected (401). It is probably incomplete or expired — create a new one.") };
    }
    if (probe.status === 403 || probe.status === 404) {
      return { ok: false, message: say(lang,
        `Токен не видит репозиторий ${GITHUB_REPO}. В настройках токена: Repository access -> Only select repositories -> выбери «${GITHUB_REPO.split("/")[1]}».`,
        `The token cannot see ${GITHUB_REPO}. In the token settings: Repository access -> Only select repositories -> pick "${GITHUB_REPO.split("/")[1]}".`) };
    }
    if (!probe.ok) return fail(probe.status);

    const perms = (await probe.json())?.permissions;
    if (perms && perms.push === false) {
      return { ok: false, message: say(lang,
        "Репозиторий токен видит, но писать в него не может. В настройках токена: Permissions -> Repository permissions -> Contents -> поставь Read and write (сейчас стоит Read-only).",
        "The token can see the repository but cannot write. In the token settings: Permissions -> Repository permissions -> Contents -> set Read and write (currently Read-only).") };
    }

    // 1) Где сейчас находится ветка.
    const refRes = await fetch(`${repo}/git/ref/heads/${encodeURIComponent(GITHUB_BRANCH)}`, { headers: h });
    if (!refRes.ok) return fail(refRes.status);
    const baseSha = (await refRes.json())?.object?.sha as string;

    const commitRes = await fetch(`${repo}/git/commits/${baseSha}`, { headers: h });
    if (!commitRes.ok) return fail(commitRes.status);
    const baseTree = (await commitRes.json())?.tree?.sha as string;

    // 2) Загружаем содержимое файлов.
    const blobs: { path: string; sha: string }[] = [];
    for (const f of files) {
      const res = await fetch(`${repo}/git/blobs`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ content: toBase64(f.content), encoding: "base64" }),
      });
      if (res.status === 403) {
        return { ok: false, message: say(lang,
          "GitHub не разрешил запись (403). Проверь, что у токена Contents стоит Read and write, а репозиторий выбран в Repository access.",
          "GitHub refused the write (403). Check that the token has Contents: Read and write and the repository selected.") };
      }
      if (!res.ok) return fail(res.status);
      blobs.push({ path: f.path, sha: (await res.json()).sha });
    }

    // 3) Новое дерево поверх текущего.
    const treeRes = await fetch(`${repo}/git/trees`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        base_tree: baseTree,
        tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
      }),
    });
    if (!treeRes.ok) return fail(treeRes.status);
    const treeSha = (await treeRes.json()).sha;

    // 4) Коммит.
    const msg = files.length > 1
      ? "content: обновление сайта из редактора"
      : `content: обновление ${files[0].path} из редактора`;
    const newCommit = await fetch(`${repo}/git/commits`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ message: msg, tree: treeSha, parents: [baseSha] }),
    });
    if (!newCommit.ok) return fail(newCommit.status);
    const commit = await newCommit.json();

    // 5) Двигаем ветку на новый коммит.
    const upd = await fetch(`${repo}/git/refs/heads/${encodeURIComponent(GITHUB_BRANCH)}`, {
      method: "PATCH",
      headers: h,
      body: JSON.stringify({ sha: commit.sha }),
    });
    if (upd.status === 422) {
      return { ok: false, message: say(lang,
        "В репозитории появились более новые изменения. Обнови страницу и опубликуй заново.",
        "The repository has newer changes. Reload the page and publish again.") };
    }
    if (!upd.ok) return fail(upd.status);

    return {
      ok: true,
      commitUrl: commit.html_url,
      message: say(lang,
        "Опубликовано. GitHub пересобирает сайт — обычно занимает 1-2 минуты.",
        "Published. GitHub is rebuilding the site — usually 1-2 minutes."),
    };
  } catch {
    return { ok: false, message: say(lang,
      "Нет связи с GitHub. Проверь интернет и попробуй ещё раз.",
      "Could not reach GitHub. Check your connection and try again.") };
  }
}

/** Ссылка на вкладку Actions — чтобы посмотреть, как идёт пересборка. */
export const actionsUrl = () => `https://github.com/${GITHUB_REPO}/actions`;
