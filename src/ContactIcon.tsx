// ============================================================================
//   ЗНАЧКИ КОНТАКТОВ — официальные логотипы
//
//   Берутся из пакета simple-icons: это официальные SVG брендов, выложенные
//   под лицензией CC0. Логотип вшивается в страницу на этапе сборки, поэтому
//   у посетителя не уходит ни одного запроса на чужой сервер.
//
//   Обновить логотипы, если бренд сменил знак:  npm update simple-icons
//
//   Почта и «просто ссылка» — не бренды, поэтому для них свои значки
//   в стиле остальных иконок сайта (тонкая линия).
// ============================================================================

import {
  siTelegram, siDiscord, siGithub, siItchdotio, siYoutube,
  siTwitch, siVk, siX, siSteam, siBoosty,
} from "simple-icons";
import type { ServiceKey } from "./contacts";

/** Официальные логотипы: у simple-icons это заливка, а не обводка. */
const BRANDS: Partial<Record<ServiceKey, { title: string; path: string }>> = {
  telegram: siTelegram,
  discord:  siDiscord,
  github:   siGithub,
  itch:     siItchdotio,
  youtube:  siYoutube,
  twitch:   siTwitch,
  vk:       siVk,
  x:        siX,
  steam:    siSteam,
  boosty:   siBoosty,
};

export default function ContactIcon({ service }: { service: ServiceKey }) {
  const brand = BRANDS[service];

  if (brand) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={brand.title}>
        <path d={brand.path} />
      </svg>
    );
  }

  // Не бренд — рисуем сами, в стиле прочих иконок сайта.
  const stroke = {
    width: 15, height: 15, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };

  if (service === "email") {
    return <svg {...stroke}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 8l-10 6L2 8" /></svg>;
  }

  return (
    <svg {...stroke}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}
