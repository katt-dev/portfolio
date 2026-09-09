// ============================================================================
//   ЗНАЧКИ КОНТАКТОВ
//
//   Это НЕ официальные логотипы сервисов, а свои простые значки в том же
//   стиле, что и остальные иконки сайта (тонкая линия, скруглённые концы).
//   Узнаваемость даёт фирменный цвет плашки — он задаётся в index.css
//   через переменную --brand для класса .contacts__item--<сервис>.
//
//   Официальные логотипы намеренно не используются: у каждого сервиса свои
//   правила использования знака, а перерисованный по памяти логотип всё
//   равно выглядит криво.
// ============================================================================

import type { ServiceKey } from "./contacts";

const S = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ContactIcon({ service }: { service: ServiceKey }) {
  switch (service) {
    case "telegram": // бумажный самолётик
      return <svg {...S}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>;

    case "discord": // облачко реплики с двумя точками
      return <svg {...S}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 20l1.9-5.7A8.4 8.4 0 0 1 4 10.5 8.5 8.5 0 0 1 8.7 2.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" /><circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" /></svg>;

    case "github": // угловые скобки
      return <svg {...S}><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></svg>;

    case "itch": // геймпад
      return <svg {...S}><path d="M6 12h4M8 10v4" /><circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="17.5" cy="14" r="1" fill="currentColor" stroke="none" /><rect x="2" y="6" width="20" height="12" rx="5" /></svg>;

    case "youtube": // прямоугольник с треугольником
      return <svg {...S}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9.5l5 2.5-5 2.5v-5z" /></svg>;

    case "twitch": // экран с ножкой
      return <svg {...S}><path d="M4 3h16v11l-4 4h-4l-3 3v-3H4z" /><path d="M11 8v4M15 8v4" /></svg>;

    case "vk": // облачко реплики
      return <svg {...S}><path d="M21 14a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" /></svg>;

    case "x": // косой крест
      return <svg {...S}><path d="M5 5l14 14M19 5L5 19" /></svg>;

    case "steam": // круг с точкой внутри
      return <svg {...S}><circle cx="12" cy="12" r="9" /><circle cx="14" cy="10" r="3" /><path d="M3.5 15.5l5.5 2.2" /></svg>;

    case "boosty": // сердце
      return <svg {...S}><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z" /></svg>;

    case "email": // конверт
      return <svg {...S}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 8l-10 6L2 8" /></svg>;

    default: // просто ссылка
      return <svg {...S}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>;
  }
}
