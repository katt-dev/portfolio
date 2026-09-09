// ============================================================================
//
//   ЭТОТ ФАЙЛ — ТОЛЬКО НАСТРОЙКИ И КОНТЕНТ.
//
//   Вся логика сайта лежит отдельно в  src/App.tsx  и сама подтянет всё,
//   что ты напишешь здесь. Поэтому этот файл можно спокойно заменять,
//   копировать и править — код главного экрана и проектов НЕ пострадает.
//
//   КАК ПОЛЬЗОВАТЬСЯ:
//   1) Имя / почта / портрет ....... блок «1. ПРО СЕБЯ»
//   2) Кнопки и заголовки ........... блок «2. ТЕКСТЫ САЙТА»
//      у каждой надписи есть ru: (русский) и en: (английский)
//   3) Стадии проекта ............... блок «3. СТАДИИ»
//   4) ОБЛОЖКИ и скриншоты .......... блок «4. ПРОЕКТЫ»
//
//      меняй только текст внутри кавычек  "вот так"
//      кавычки, запятые и скобки не удаляй
//
//   ГДЕ КАКАЯ КАРТИНКА В ПРОЕКТЕ:
//     cover    = обложка на карточке (видно на главной)
//     images   = фото, которые листаются внутри окна
//                  src     -> ссылка на картинку
//                  caption -> подпись под фото (ru / en)
//     team     = команда, с кем делался проект
//                  avatar -> фото человека. Оставь "" — аватарка просто
//                            не покажется, имя останется.
//                  email  -> почта. Оставь "" — кнопка «написать
//                            руководителю» не покажется.
//
//   ДОБАВИТЬ ПРОЕКТ  = скопировать блок { ... } и вставить перед ] ниже
//   УДАЛИТЬ ПРОЕКТ   = стереть блок целиком вместе с его запятой
//
//   ПРОЩЕ: запусти у себя  npm run dev , открой localhost:5173 и нажми
//   Ctrl+Shift+E — откроется редактор проектов, где можно добавлять и
//   удалять проекты и перетаскивать скриншоты мышкой. На самом сайте
//   этого редактора нет — он работает только у тебя на компьютере.
//
// ============================================================================


// ----------------------------------------------------------------------------
//  ТИПЫ (НЕ ТРОГАЙ — нужны сайту, чтобы понимать структуру данных)
// ----------------------------------------------------------------------------
export type Lang = "ru" | "en";
export interface TextPair { ru: string; en: string }
export interface ProjectImage { src: string; caption: TextPair }
export interface TeamMember {
  name: string;
  role: TextPair;
  avatar: string;   // пусто "" -> аватарка не показывается
  email?: string;   // пусто "" или нет поля -> кнопка «написать» скрыта
}

// Стадия проекта. Допустимые значения — ключи из STATUS (блок 3):
//   "concept" | "alpha" | "beta" | "early" | "release"
// Пусто "" -> плашка со стадией не показывается.
export type ProjectStatus = "" | "concept" | "alpha" | "beta" | "early" | "release";

export interface Project {
  id: string;
  num: string;
  year: string;
  engine: string;
  status: ProjectStatus;
  tags: string[];
  cover: string;
  title: TextPair;
  subtitle: TextPair;
  description: TextPair;
  myRole: TextPair;

  // ССЫЛКА НА ИГРУ / СТРАНИЦУ В STEAM
  //   linkUrl   — адрес страницы (например https://store.steampowered.com/app/... )
  //               оставь "" (пустые кавычки), если ссылки нет — кнопка просто скроется
  //   linkLabel — надпись на кнопке (ru / en)
  linkUrl: string;
  linkLabel: TextPair;

  images: ProjectImage[];
  team: TeamMember[];
}


// ============================================================================
//  1. ПРО СЕБЯ — имя, контакты, портрет
// ============================================================================

export const NAME:     string = "katt";           // полное имя (футер, подпись у фото)
export const EMAIL:    string = ""; // почта. Пусто "" -> кнопки «написать» скрыты
export const DISCORD:  string = "Telegram: @katt_dev\nDiscord: @katt.dev"; // строка под почтой в «Контактах»
export const BADGE:    string = "Game Developer";

// Портрет на главном экране — вставь ссылку на своё фото:
export const PORTRAIT: string = "https://allwebs.ru/images/2026/09/08/a5da47961c2b1621944291e9941d5015.png";


// ============================================================================
//  2. ТЕКСТЫ САЙТА — все надписи, что видит посетитель (два языка)
// ============================================================================

export const UI = {
  ru: {
    firstName:   "katt",
    lastName:    "",
    logo:        "katt",
    location:    "Ahaha Studio(Основная) · Ancy Forge Studio(Неофициальная)",
    heroBio:     "Game Developer · C# · Unity · Godot 4",
    about: [
      "Я разработчик игр, специализирующийся на создании игр под ключ. ",
      "Самостоятельно занимаюсь практически всеми аспектами разработки - от проектирования игровой логики и интерфейса до работы с механиками, системами и визуальной частью.",
      "Единственное направление, которым я не занимаюсь, - серверная разработка.",
    ],
    navProjects: "Проекты",
    navAbout:    "Обо мне",
    navContact:  "Контакты",
    viewWork:    "Смотреть проекты",
    writeMe:     "Написать на почту",
    featured:    "Избранные проекты",
    clickHint:   "Нажми на блок, чтобы открыть кейс",
    aboutTitle:  "Обо мне",
    aboutSub:    "Краткая биография",
    // НАЗВАНИЕ ВКЛАДКИ БРАУЗЕРА (то, что видно на самой вкладке)
    tabTitle:    "katt — Game Developer",
    contactTitle:"Контакты",
    contactMe:   "Связаться со мной",
    contactNote: "Открыт для интересных проектов, консультаций и разговоров о геймдеве. Обычно отвечаю в течение 3-х часов.",
    handmade:    "Сделано на заказ",
    teamLabel:   "Команда проекта",
    roleLabel:   "Моя роль",
    statusLabel: "Стадия",
    mailBtn:     "Написать руководителю",
    settings:    "Настройки",
    language:    "Язык сайта",
    langHint:    "Выбор запоминается и не сбрасывается после перезагрузки.",
    close:       "Закрыть",
    themeAria:   "Сменить тему",
    settingsAria:"Открыть настройки",
  },
  en: {
    firstName:   "katt",
    lastName:    "",
    logo:        "katt",
    location:    "Studios: «Ahaha Studio» «Ancy Forge Studio»",
    heroBio:     "Unity · Godot 4",
    about: [
      "Coding in Python, C#, GDScript.",
      "",
      "",
    ],
    navProjects: "Work",
    navAbout:    "About",
    navContact:  "Contact",
    viewWork:    "View projects",
    writeMe:     "Write me",
    featured:    "Selected work",
    clickHint:   "Click a card to open the case",
    aboutTitle:  "About",
    aboutSub:    "Short bio",
    // BROWSER TAB TITLE
    tabTitle:    "katt — Game Developer",
    contactTitle:"Contact",
    contactMe:   "Get in touch",
    contactNote: "Open to interesting projects, consulting and gamedev talk. I usually reply within 3 hours.",
    handmade:    "Made to order",
    teamLabel:   "Project team",
    roleLabel:   "My role",
    statusLabel: "Stage",
    mailBtn:     "Email the lead",
    settings:    "Settings",
    language:    "Site language",
    langHint:    "Your choice is saved and survives a page reload.",
    close:       "Close",
    themeAria:   "Toggle theme",
    settingsAria:"Open settings",
  },
};

export type UiText = (typeof UI)["ru"];


// ============================================================================
//  3. СТАДИИ ПРОЕКТА — надписи на плашке (ru / en)
//
//     Ключ слева ("alpha", "beta" …) — это то, что пишется в поле  status
//     у проекта. Меняй только текст в кавычках.
// ============================================================================

export const STATUS: Record<Exclude<ProjectStatus, "">, TextPair> = {
  concept: { ru: "В разработке",  en: "In development" },
  alpha:   { ru: "Альфа-тест",    en: "Alpha test" },
  beta:    { ru: "Бета-тест",     en: "Beta test" },
  early:   { ru: "Ранний доступ", en: "Early access" },
  release: { ru: "Релиз",         en: "Released" },
};

// Порядок стадий в выпадающем списке редактора
export const STATUS_ORDER = ["concept", "alpha", "beta", "early", "release"] as const;


// ============================================================================
//  4. ПРОЕКТЫ
//
//     cover     -> ОБЛОЖКА КАРТОЧКИ (видно на главной)
//     status    -> стадия: "concept" | "alpha" | "beta" | "early" | "release"
//                  или "" — тогда плашки не будет
//     images    -> скриншоты, которые листаются в окне
//     team      -> с кем делался проект
// ============================================================================

export const PROJECTS: Project[] = [
  {
    id: "PiWorld",
    num: "01",
    year: "2026",
    engine: "Unity",
    status: "early",
    tags: ["Unity · C#", "Adventure", "Survival", "Steam Release"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://allwebs.ru/images/2026/09/08/14f4b94773a872806a5f8385f8abc186.png",

    title:       { ru: "Piworld", en: "Piworld" },
    subtitle:    { ru: "", en: "" },
    description: { ru: "", en: "" },
    myRole:      { ru: "General developer / Главный разработчик", en: "General developer / Lead Developer" },

    // ССЫЛКА НА СТРАНИЦУ ИГРЫ (Steam / itch.io / сайт). Пусто = кнопка скрыта
    linkUrl:     "https://store.steampowered.com/app/3167710/Piworld/",
    linkLabel:   { ru: "Страница в Steam", en: "View on Steam" },

    images: [
      { src: "https://allwebs.ru/images/2026/09/08/005dfe359ce32db63ade00aba6fb64c8.jpg", caption: { ru: "Меню", en: "Menu" } },
      { src: "https://allwebs.ru/images/2026/09/08/5e773898998094456e2791ddd72859a9.png", caption: { ru: "Страница в магазине", en: "Steam page" } },
    ],
    team: [
      { name: "Kippen",    role: { ru: "General Designer", en: "General Designer" }, avatar: "https://allwebs.ru/images/2026/09/08/395cbb25753439f45f604551eaba35ee.png", email: "" },
      { name: "Santiago",  role: { ru: "Server Developer", en: "Server Developer" }, avatar: "https://allwebs.ru/images/2026/09/09/d25b1ccf4de2dfd0dd9ad8721174166b.jpg", email: "" },
      { name: "Serkov1ch", role: { ru: "Team Leader",      en: "Team Leader" },      avatar: "https://allwebs.ru/images/2026/09/09/d25b1ccf4de2dfd0dd9ad8721174166b.jpg", email: "" },
    ],
  },
];
