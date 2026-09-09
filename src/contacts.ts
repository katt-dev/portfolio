// ============================================================================
//   КОНТАКТЫ — ссылки на телеграм, почту и прочее
//
//   У каждого контакта три поля:
//     label — подпись слева ("Telegram", "Почта")
//     value — то, что видно ("@katt_dev")
//     url   — куда ведёт клик. МОЖНО ОСТАВИТЬ ПУСТЫМ:
//             тогда адрес подберётся сам по подписи и значению.
//
//   Если адрес подобрать не удалось (например, у Discord нет публичной ссылки
//   на профиль), контакт не станет ссылкой — по клику значение просто
//   скопируется в буфер обмена.
// ============================================================================

export interface ContactItem {
  label: string;
  value: string;
  url: string;
}

/** Убираем @ и пробелы — в ссылках ник нужен «голым». */
const handle = (v: string) => v.trim().replace(/^@+/, "");

/** Похоже на почту? */
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/**
 * Подбирает адрес по подписи и значению.
 * Возвращает "" — значит ссылки нет, будет копирование по клику.
 */
export function resolveUrl(item: ContactItem): string {
  const url = item.url.trim();
  if (url) return url;                       // задано вручную — не трогаем

  const value = item.value.trim();
  if (!value) return "";

  // Уже полноценный адрес
  if (/^https?:\/\//i.test(value)) return value;
  if (/^mailto:/i.test(value)) return value;
  if (isEmail(value)) return `mailto:${value}`;

  // Домен без протокола: katt.itch.io, vk.com/katt
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value)) return `https://${value}`;

  const key = `${item.label} ${value}`.toLowerCase();
  const h = handle(value);
  if (!h) return "";

  if (/telegram|tg\b|t\.me/.test(key))      return `https://t.me/${h}`;
  if (/github/.test(key))                   return `https://github.com/${h}`;
  if (/itch/.test(key))                     return `https://${h}.itch.io`;
  if (/youtube|ютуб/.test(key))             return `https://youtube.com/@${h}`;
  if (/twitch/.test(key))                   return `https://twitch.tv/${h}`;
  if (/\bvk\b|вконтакте/.test(key))         return `https://vk.com/${h}`;
  if (/twitter|\bx\b/.test(key))            return `https://x.com/${h}`;
  if (/steam/.test(key))                    return `https://steamcommunity.com/id/${h}`;
  if (/boosty/.test(key))                   return `https://boosty.to/${h}`;

  // Discord, Roblox и прочее без публичного профиля — копируем по клику.
  return "";
}

/**
 * Старый формат: одна строка с переводами строк вида
 *   "Telegram: @katt_dev\nDiscord: @katt.dev"
 * Превращаем в список контактов, чтобы ничего не потерялось.
 */
export function parseLegacyContacts(text: string): ContactItem[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      // Двоеточие внутри ссылки (https://) подписью не считаем
      if (i > 0 && !/^https?$/i.test(line.slice(0, i))) {
        return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim(), url: "" };
      }
      return { label: "", value: line, url: "" };
    });
}


/**
 * Определяет сервис — по нему подбираются цвет и иконка плашки.
 * Возвращает "link" для всего неопознанного.
 */
export type ServiceKey =
  | "telegram" | "discord" | "github" | "itch" | "youtube" | "twitch"
  | "vk" | "x" | "steam" | "boosty" | "email" | "link";

export function detectService(item: ContactItem): ServiceKey {
  const key = `${item.label} ${item.value} ${item.url}`.toLowerCase();

  // Отдельные слова — чтобы короткие названия ("vk", "x", "tg") не ловились
  // внутри посторонних слов вроде "max" или "vkontakte-fanclub".
  const words = key.split(/[^a-zа-я0-9.]+/i).filter(Boolean);
  const has = (...n: string[]) => n.some((x) => key.includes(x));
  const word = (...n: string[]) => n.some((x) => words.includes(x));

  if (has("telegram", "t.me", "телеграм") || word("tg")) return "telegram";
  if (has("discord")) return "discord";
  if (has("github")) return "github";
  if (has("itch")) return "itch";
  if (has("youtube", "youtu.be", "ютуб")) return "youtube";
  if (has("twitch")) return "twitch";
  if (has("vk.com", "вконтакте") || word("vk")) return "vk";
  if (has("twitter", "x.com") || word("x")) return "x";
  if (has("steam")) return "steam";
  if (has("boosty")) return "boosty";
  if (has("mailto:", "почта", "email", "e-mail") || isEmail(item.value.trim())) return "email";

  return "link";
}
