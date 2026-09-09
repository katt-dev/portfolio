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
//   ПРОЩЕ: открой сайт по секретному адресу (см. ADMIN_SECRET ниже) —
//   откроется редактор проектов: добавить/удалить проект, перетащить
//   скриншоты. Браузер запомнит тебя, дальше заходи как обычно.
//
// ============================================================================


import projectsData from "./projects.json";

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


// ----------------------------------------------------------------------------
//  СЕКРЕТНОЕ СЛОВО ДЛЯ ВХОДА В РЕДАКТОР
//
//  Заходишь ОДИН РАЗ по адресу:
//      https://ka1tt.github.io/portfolio/#это-слово
//
//  После этого браузер тебя запомнит: в меню-шестерёнке появится кнопка
//  «Редактор проектов», и будет работать Ctrl+Shift+E. Секрет из адресной
//  строки стирается сам, в истории браузера не остаётся.
//
//  Выйти на этом браузере:  открыть сайт с  #exit
//
//  Слово можно поменять на любое своё — без пробелов, латиница и цифры.
//  Поменял -> нужно снова зайти по новому адресу.
// ----------------------------------------------------------------------------
export const ADMIN_SECRET: string = "katt-edit-2026";


// ----------------------------------------------------------------------------
//  КУДА РЕДАКТОР ПУБЛИКУЕТ ПРОЕКТЫ
//
//  Кнопка «Опубликовать на сайт» коммитит файл PROJECTS_PATH в этот
//  репозиторий, после чего GitHub Actions пересобирает сайт.
//  Менять тут обычно нечего.
// ----------------------------------------------------------------------------
export const GITHUB_REPO: string   = "ka1tt/portfolio"; // имя/репозиторий
export const GITHUB_BRANCH: string = "main";
export const PROJECTS_PATH: string = "src/projects.json";


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
    editorBtn:   "Редактор проектов",
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
    editorBtn:   "Project editor",
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
//   Сами проекты лежат в отдельном файле  src/projects.json .
//   Его пишет редактор, когда ты нажимаешь «Опубликовать на сайт», поэтому
//   руками его править обычно не нужно (но можно — это обычный JSON).
//
//   Поля те же, что описаны в самом верху файла:
//     cover   -> обложка карточки
//     status  -> "concept" | "alpha" | "beta" | "early" | "release" | ""
//     images  -> скриншоты, team -> команда
// ============================================================================

export const PROJECTS: Project[] = projectsData as unknown as Project[];
