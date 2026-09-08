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
//   3) ОБЛОЖКИ и скриншоты ......... блок «3. ПРОЕКТЫ»
//
//
//      меняй только текст внутри кавычек  "вот так"
//      кавычки, запятые и скобки не удаляй
//
//   ГДЕ КАКАЯ КАРТИНКА В ПРОЕКТЕ:
//     cover    = обложка на карточке (видно на главной)
//     images   = фото, которые листаются внутри окна
//                  src     → ссылка на картинку
//                  caption → подпись под фото (ru / en)
//     team     = команда, с кем делался проект
//                  avatar → фото человека, role → должность
//
//   ДОБАВИТЬ ПРОЕКТ  = скопировать блок { ... } и вставить перед ] ниже
//   УДАЛИТЬ ПРОЕКТ  = стереть блок целиком вместе с его запятой
//   (но проще менять обложки и тексты в уже готовых блоках)
//
// ============================================================================


// ----------------------------------------------------------------------------
//  ТИПЫ (НЕ ТРОГАЙ — нужны сайту, чтобы понимать структуру данных)
// ----------------------------------------------------------------------------
export type Lang = "ru" | "en";
export interface TextPair { ru: string; en: string }
export interface ProjectImage { src: string; caption: TextPair }
export interface TeamMember { name: string; role: TextPair; avatar: string }
export interface Project {
  id: string;
  num: string;
  year: string;
  engine: string;
  tags: string[];
  cover: string;
  title: TextPair;
  subtitle: TextPair;
  description: TextPair;
  myRole: TextPair;
  images: ProjectImage[];
  team: TeamMember[];
}


// ============================================================================
//  1. ПРО СЕБЯ — имя, контакты, портрет
// ============================================================================

export const NAME       = "Савелий Титов";           // полное имя (футер, подпись у фото)
export const EMAIL      = ""; // почта для кнопки «Написать»
export const DISCORD    = "Discord: @katt.dev"; // строка под почтой в «Контактах»
export const BADGE      = "Game Developer";

// Портрет на главном экране — вставь ссылку на своё фото:
export const PORTRAIT   = "img/Kattav.png";


// ============================================================================
//  2. ТЕКСТЫ САЙТА — все надписи, что видит посетитель (два языка)
// ============================================================================

export const UI = {
  ru: {
    firstName:   "Савелий",
    lastName:    "Титов",
    logo:        "Т. Савелий // Gamedev",
    location:    "Студии «Ancy Forge Studio» «Ahaha Studio» · ",
    heroBio:     "",
    about: [
      "",
      "",
      "",
    ],
    navProjects: "Проекты",
    navAbout:    "Обо мне",
    navContact:  "Контакты",
    viewWork:    "Смотреть проекты",
    writeMe:     "Написать",
    featured:    "Избранные проекты",
    clickHint:   "Нажми на блок, чтобы открыть кейс",
    aboutTitle:  "Обо мне",
    aboutSub:    "Краткая биография",
    contactMe:   "Связаться со мной",
    contactNote: "Открыт для интересных проектов, консультаций и разговоров о геймдеве. Обычно отвечаю в течение суток.",
    handmade:    "Сделано на заказ",
    teamLabel:   "Команда проекта",
    roleLabel:   "Моя роль",
    mailBtn:     "Написать на почту",
    settings:    "Настройки",
    language:    "Язык сайта",
    langHint:    "Выбор запоминается и не сбрасывается после перезагрузки.",
    close:       "Закрыть",
    themeAria:   "Сменить тему",
    settingsAria:"Открыть настройки",
  },
  en: {
    firstName:   "Saveliy",
    lastName:    "Titov",
    logo:        "T. Saveliy // Gamedev",
    location:    "studio «Ahaha Studio» «Ancy Forge Studio» · Year",
    heroBio:     "",
    about: [
      "",
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
    contactMe:   "Get in touch",
    contactNote: "Open to interesting projects, consulting, and conversations about games. I usually reply within a day.",
    handmade:    "Made to order",
    teamLabel:   "Project team",
    roleLabel:   "My role",
    mailBtn:     "Email me",
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
//  3. ПРОЕКТЫ
//
//     cover     → ОБЛОЖКА КАРТОЧКИ (видно на главной)
//     images    → скриншоты, которые листаются в окне
//     team      → с кем делался проект
// ============================================================================

export const PROJECTS: Project[] = [
  {
    id: "PiWorld",
    num: "01",
    year: "2026",
    engine: "Unity",
    tags: ["Unity · C#", "Adventure", "Survival", "Steam Release"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "img/Logo.png",

    title:       { ru: "ПиВорлд", en: "PiWorld" },
    subtitle:    { ru: "", en: "" },
    description: { ru: "", en: "" },
    myRole:      { ru: "General developer / Главный разработчик", en: "General developer / Lead Developer" },

    images: [
      { src: "img/screenshot.jpg", caption: { ru: "Меню", en: "Menu" } },
      { src: "img/PiWorld.png", caption: { ru: "Страница в магазине", en: "Steam page" } },
      { src: "", caption: { ru: "-", en: "-" } },
    ],
    team: [
      { name: "Kippen",   role: { ru: "General Designer", en: "General Designer" }, avatar: "img/avatarka.png" },
      { name: "Santiago",  role: { ru: "Server Developer",         en: "Server Developer" },         avatar: "" },
      { name: "Serkov1ch", role: { ru: "Team Leader",      en: "Team Leader" },      avatar: "" },
    ],
  },
  {
    id: "iron-convoy",
    num: "02",
    year: "2024",
    engine: "Unity 6",
    tags: ["Unity · C#", "Tactical Roguelite", "Procedural"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://images.pexels.com/photos/6893930/pexels-photo-6893930.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

    title:       { ru: "Iron Convoy 2084", en: "Iron Convoy 2084" },
    subtitle:    { ru: "Тактический roguelite о бронепоезде в постапокалиптической пустоши", en: "Tactical roguelite about an armored train in a post-apocalyptic waste" },
    description: { ru: "Игрок управляет экипажем гигантского бронепоезда, модернизирует вагоны-турели и распределяет энергию реактора в реальном времени. Я спроектировал процедурную генерацию маршрутов, баллистику орудий и систему повреждений отсеков.", en: "The player runs the crew of a giant armored train, upgrades turret cars and allocates reactor power in real time. I designed procedural route generation, gun ballistics, and a compartment damage system." },
    myRole:      { ru: "Systems Designer & Lead Programmer", en: "Systems Designer & Lead Programmer" },

    images: [
      { src: "https://images.pexels.com/photos/6893930/pexels-photo-6893930.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Тактическое управление вагонами", en: "Tactical control of the train cars" } },
      { src: "https://images.pexels.com/photos/19880807/pexels-photo-19880807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Прототипирование отсеков", en: "Prototyping the compartments" } },
    ],
    team: [
      { name: "Денис Ковалёв", role: { ru: "2D/3D Concept Artist", en: "2D/3D Concept Artist" }, avatar: "https://images.pexels.com/photos/9618108/pexels-photo-9618108.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
      { name: "Ольга Ветрова", role: { ru: "UI/UX & VFX Artist",   en: "UI/UX & VFX Artist" },   avatar: "https://images.pexels.com/photos/16886370/pexels-photo-16886370.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
    ],
  },
  {
    id: "kobold-protocol",
    num: "03",
    year: "2024",
    engine: "Unreal Engine 5",
    tags: ["Co-op Multiplayer", "Netcode", "Physics Stealth"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://images.pexels.com/photos/16313654/pexels-photo-16313654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

    title:       { ru: "Kobold Protocol", en: "Kobold Protocol" },
    subtitle:    { ru: "Кооперативный стелс-экшен на 4 игроков с физикой окружения", en: "4-player co-op stealth-action with environmental physics" },
    description: { ru: "Командный стелс-экшен, где игроки проникают в процедурно генерируемые подземные комплексы. Написал сетевую синхронизацию физики предметов, голосовую рацию с затуханием звука по геометрии уровня и кооперативные гаджеты.", en: "A team stealth-action where players infiltrate procedurally generated underground complexes. I wrote networked physics sync for props, a voice radio that occludes by level geometry, and co-op gadgets." },
    myRole:      { ru: "Network & Gameplay Programmer", en: "Network & Gameplay Programmer" },

    images: [
      { src: "https://images.pexels.com/photos/16313654/pexels-photo-16313654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Тестирование сетевой синхронизации", en: "Testing network synchronization" } },
      { src: "https://images.pexels.com/photos/30143553/pexels-photo-30143553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Подземные лаборатории и ночное видение", en: "Underground labs and night vision" } },
    ],
    team: [
      { name: "Артём Морозов", role: { ru: "Level Designer",    en: "Level Designer" },    avatar: "https://images.pexels.com/photos/16886374/pexels-photo-16886374.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
      { name: "Ксения Ли",    role: { ru: "Character Animator", en: "Character Animator" }, avatar: "https://images.pexels.com/photos/19880807/pexels-photo-19880807.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
    ],
  },
  {
    id: "chronos-drift",
    num: "04",
    year: "2023",
    engine: "Unreal Engine 5",
    tags: ["Action Slasher", "Custom Shaders", "Combat System"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://images.pexels.com/photos/9618108/pexels-photo-9618108.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

    title:       { ru: "Chronos Drift", en: "Chronos Drift" },
    subtitle:    { ru: "Динамичный слэшер с механикой перемотки времени в бою", en: "Fast slasher with a combat time-rewind mechanic" },
    description: { ru: "Боевая система строится на записи последних 5 секунд действий игрока и мгновенном создании временного клона, повторяющего удары. Сделал кастомную буферизацию трансформов и анимаций без просадки FPS.", en: "Combat is built around recording the last 5 seconds of player actions and spawning a time-clone that repeats the strikes. Custom transform and animation buffering, no FPS drop." },
    myRole:      { ru: "Combat Designer / Tech Artist", en: "Combat Designer / Tech Artist" },

    images: [
      { src: "https://images.pexels.com/photos/9618108/pexels-photo-9618108.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Шлейф временного клона", en: "Time-clone trail" } },
      { src: "https://images.pexels.com/photos/30123507/pexels-photo-30123507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Хитбоксы и тайминги комбо", en: "Hitboxes and combo timings" } },
    ],
    team: [
      { name: "Роман Белов",   role: { ru: "VFX & Shader Artist",    en: "VFX & Shader Artist" },    avatar: "https://images.pexels.com/photos/16886370/pexels-photo-16886370.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
      { name: "Марина Савина", role: { ru: "Композитор саундтрека",  en: "Composer" },               avatar: "https://images.pexels.com/photos/16313654/pexels-photo-16313654.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
    ],
  },
  {
    id: "signal-lost",
    num: "05",
    year: "2023",
    engine: "Godot 4",
    tags: ["Godot 4 · GDScript", "Narrative Puzzle", "Retro 3D"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://images.pexels.com/photos/19880807/pexels-photo-19880807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

    title:       { ru: "Signal Lost: Station 9", en: "Signal Lost: Station 9" },
    subtitle:    { ru: "Ретро-футуристический детектив на полярной радиостанции", en: "Retro-futurist detective on a polar radio station" },
    description: { ru: "Игрок расшифровывает радиоперехваты на аналоговой аппаратуре 80-х годов, вращает антенны и сопоставляет координаты. Все приборы в комнате полностью интерактивны — каждый тумблер и осциллограф работают по законам радиотехники.", en: "The player decrypts radio intercepts on 1980s analog gear, rotates antennas and matches coordinates. Every device in the room is fully interactive — switches and oscilloscopes follow real radio physics." },
    myRole:      { ru: "Gameplay Programmer & Sound Integrator", en: "Gameplay Programmer & Sound Integrator" },

    images: [
      { src: "https://images.pexels.com/photos/19880807/pexels-photo-19880807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Интерактивная радиорубка", en: "Interactive radio room" } },
      { src: "https://images.pexels.com/photos/6893930/pexels-photo-6893930.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Журнал дешифровки сигналов", en: "Signal decryption log" } },
    ],
    team: [
      { name: "Павел Зотов", role: { ru: "3D Prop Artist", en: "3D Prop Artist" }, avatar: "https://images.pexels.com/photos/9618108/pexels-photo-9618108.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
    ],
  },
  {
    id: "boreal-tools",
    num: "06",
    year: "2022",
    engine: "UE5 Plugin · C++",
    tags: ["Unreal Plugin", "Tools Dev", "Open Source"],

    // ▼▼▼ ОБЛОЖКА КАРТОЧКИ — меняй ссылку ниже ▼▼▼
    cover: "https://images.pexels.com/photos/30123507/pexels-photo-30123507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",

    title:       { ru: "Boreal Dialogue Kit", en: "Boreal Dialogue Kit" },
    subtitle:    { ru: "Плагин для нелинейных диалогов и квестов в UE5 — Open Source", en: "Open-source UE5 plugin for branching dialogue and quests" },
    description: { ru: "Инструментарий для нашей команды и других инди-разработчиков. Позволяет сценаристам собирать ветвящиеся диалоги и условия квестов в нодовом графе с мгновенной проверкой переменных и экспортом локализации.", en: "A toolkit for our team and other indie developers. Writers assemble branching dialogue and quest conditions in a node graph with live variable checks and localization export." },
    myRole:      { ru: "Tools Programmer / Автор плагина", en: "Tools Programmer / Plugin author" },

    images: [
      { src: "https://images.pexels.com/photos/30123507/pexels-photo-30123507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Нодовый граф диалогов в UE5", en: "Dialogue node graph in UE5" } },
      { src: "https://images.pexels.com/photos/30143553/pexels-photo-30143553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", caption: { ru: "Локализация и озвучка", en: "Localization and voiceover" } },
    ],
    team: [
      { name: "Алиса Громова", role: { ru: "UX для сценаристов",          en: "Writer UX" },                avatar: "https://images.pexels.com/photos/16313654/pexels-photo-16313654.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
      { name: "Илья Сорокин",  role: { ru: "Техническая документация",    en: "Technical documentation" },  avatar: "https://images.pexels.com/photos/16886374/pexels-photo-16886374.jpeg?auto=compress&cs=tinysrgb&dpr=1&h=200&w=280" },
    ],
  },
];
