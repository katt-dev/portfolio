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
//   ПРОЩЕ: открой сайт, добавь #admin в конец адреса (или нажми
//   Ctrl+Shift+E) — откроется встроенный редактор проектов, где можно
//   добавлять/удалять проекты и перетаскивать скриншоты мышкой.
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

    // ---- редактор проектов (видишь только ты) ----
    ed_title:      "Редактор проектов",
    ed_open:       "Редактор проектов",
    ed_new:        "Новый проект",
    ed_delete:     "Удалить",
    ed_confirmDel: "Удалить проект? Это действие не отменить.",
    ed_export:     "Скачать projects.json",
    ed_copy:       "Скопировать код для settings.ts",
    ed_copied:     "Скопировано в буфер обмена",
    ed_reset:      "Сбросить к settings.ts",
    ed_confirmRes: "Стереть все локальные правки и вернуть проекты из settings.ts?",
    ed_empty:      "Проектов пока нет. Нажми «Новый проект».",
    ed_dropHint:   "Перетащи файл сюда или нажми Ctrl+V, чтобы вставить скриншот",
    ed_pickFile:   "Выбрать файл",
    ed_fields:     "Основное",
    ed_shots:      "Скриншоты",
    ed_team:       "Команда",
    ed_addShot:    "Добавить скриншот",
    ed_addMember:  "Добавить участника",
    ed_remove:     "Убрать",
    ed_up:         "Выше",
    ed_down:       "Ниже",
    ed_localNote:  "Правки сохраняются в этом браузере сразу. Чтобы они появились на сайте у всех — нажми «Скопировать код для settings.ts» и вставь его в src/settings.ts вместо блока PROJECTS, затем закоммить.",
    ed_lock:       "Закрыть редактор",
    ed_projects:   "Проекты",
    ed_f_id:       "ID (латиницей, без пробелов)",
    ed_f_num:      "Номер (01, 02 …)",
    ed_f_year:     "Год",
    ed_f_engine:   "Движок",
    ed_f_status:   "Стадия проекта",
    ed_f_tags:     "Теги (через запятую)",
    ed_f_cover:    "Обложка карточки",
    ed_f_title:    "Название",
    ed_f_subtitle: "Подзаголовок",
    ed_f_desc:     "Описание",
    ed_f_myRole:   "Моя роль",
    ed_f_linkUrl:  "Ссылка на игру (пусто -> кнопка скрыта)",
    ed_f_linkLabel:"Надпись на кнопке",
    ed_f_caption:  "Подпись",
    ed_f_src:      "Ссылка на картинку",
    ed_f_name:     "Имя",
    ed_f_role:     "Должность",
    ed_f_avatar:   "Аватарка (пусто -> не показывается)",
    ed_f_email:    "Почта (пусто -> кнопка скрыта)",
    ed_statusNone: "Не указана",
    ed_newProject: "Новый проект",
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

    // ---- project editor (only you can see it) ----
    ed_title:      "Project editor",
    ed_open:       "Project editor",
    ed_new:        "New project",
    ed_delete:     "Delete",
    ed_confirmDel: "Delete this project? This cannot be undone.",
    ed_export:     "Download projects.json",
    ed_copy:       "Copy code for settings.ts",
    ed_copied:     "Copied to clipboard",
    ed_reset:      "Reset to settings.ts",
    ed_confirmRes: "Discard all local edits and restore projects from settings.ts?",
    ed_empty:      "No projects yet. Click “New project”.",
    ed_dropHint:   "Drop a file here or press Ctrl+V to paste a screenshot",
    ed_pickFile:   "Choose file",
    ed_fields:     "Main",
    ed_shots:      "Screenshots",
    ed_team:       "Team",
    ed_addShot:    "Add screenshot",
    ed_addMember:  "Add member",
    ed_remove:     "Remove",
    ed_up:         "Up",
    ed_down:       "Down",
    ed_localNote:  "Edits are saved in this browser instantly. To publish them for everyone, click “Copy code for settings.ts”, paste it into src/settings.ts over the PROJECTS block and commit.",
    ed_lock:       "Close editor",
    ed_projects:   "Projects",
    ed_f_id:       "ID (latin, no spaces)",
    ed_f_num:      "Number (01, 02 …)",
    ed_f_year:     "Year",
    ed_f_engine:   "Engine",
    ed_f_status:   "Project stage",
    ed_f_tags:     "Tags (comma separated)",
    ed_f_cover:    "Card cover",
    ed_f_title:    "Title",
    ed_f_subtitle: "Subtitle",
    ed_f_desc:     "Description",
    ed_f_myRole:   "My role",
    ed_f_linkUrl:  "Game link (empty -> button hidden)",
    ed_f_linkLabel:"Button label",
    ed_f_caption:  "Caption",
    ed_f_src:      "Image URL",
    ed_f_name:     "Name",
    ed_f_role:     "Role",
    ed_f_avatar:   "Avatar (empty -> hidden)",
    ed_f_email:    "Email (empty -> button hidden)",
    ed_statusNone: "Not set",
    ed_newProject: "New project",
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
