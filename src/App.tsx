// ============================================================================
//
//   ЭТО КОД САЙТА (логика главного экрана и проектов).
//
//   Контент — имя, тексты, проекты и обложки — лежит отдельно в
//   файле  src/settings.ts . Именно его и надо править.
//
//   Проекты на главной раскладываются автоматически: сколько блоков в
//   settings.ts (или добавлено в редакторе) — столько и покажется.
//   Ширина карточек чередуется по шаблону SPAN_PATTERN ниже.
//
//   РЕДАКТОР ПРОЕКТОВ: заходишь один раз по секретному адресу
//   (ADMIN_SECRET в settings.ts), браузер тебя запоминает — дальше кнопка
//   в меню-шестерёнке или Ctrl+Shift+E. Подробности в src/adminAccess.ts.
//
// ============================================================================

import { useEffect, useState, useRef } from "react";
import { STATUS, type Lang, type Project } from "./settings";
import { loadContent, type SiteContent } from "./contentStore";
import { detectService, resolveUrl } from "./contacts";
import ContactIcon from "./ContactIcon";
import { loadProjects } from "./projectsStore";
import { checkAccessFromUrl } from "./adminAccess";
import ProjectModal from "./ProjectModal";
import ProjectEditor from "./admin/ProjectEditor";

// Ширина карточек на главной, по кругу:
//   pg-span4 = широкий блок   pg-span3 = средний   pg-span2 = узкий
const SPAN_PATTERN = ["pg-span4", "pg-span2", "pg-span2", "pg-span4", "pg-span3", "pg-span3"];

export default function App() {
  // ---------- состояние ----------
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ru" || saved === "en") return saved;
    return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  // Тексты сайта: у посетителя — из content.json, у тебя — твой черновик.
  const [content, setContent] = useState<SiteContent>(() => loadContent());
  const [active, setActive] = useState<Project | null>(null);

  const { isAdmin, editorOpen, setEditorOpen } = useAdmin();

  const copy = content.ui[lang];

  // ---------- сайд-эффекты ----------
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
    // Название вкладки браузера — меняется вместе с языком (см. tabTitle в settings.ts)
    document.title = copy.tabTitle;
  }, [lang, copy.tabTitle]);

  const open = (p: Project) => { setActive(p); setSettingsOpen(false); };
  const close = () => setActive(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !active) setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = active || editorOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active, editorOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [settingsOpen]);

  // Если проект открыт и его отредактировали/удалили — обновляем окно.
  useEffect(() => {
    if (!active) return;
    const fresh = projects.find((p) => p.id === active.id);
    if (!fresh) { setActive(null); return; }
    if (fresh !== active) setActive(fresh);
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- карточка проекта ----------
  const Card = ({ p, i }: { p: Project; i: number }) => (
    <button type="button" className="project-card" onClick={() => open(p)} style={{ animationDelay: `${0.07 * i}s` }} aria-label={`${copy.featured}: ${p.title[lang]}`}>
      <div className={`project-card__cover project-card__cover--${p.imageFit}`}>
        <img className="project-card__img" src={p.cover} alt={p.subtitle[lang]} loading="lazy" />
        <span className="project-card__badge project-card__badge--year">{p.year}</span>
        <span className="project-card__badge project-card__badge--engine">{p.engine}</span>
        {/* Плашка стадии — только если стадия указана в settings.ts / редакторе */}
        {p.status && (
          <span className={`status-chip status-chip--${p.status} project-card__status`}>
            {STATUS[p.status][lang]}
          </span>
        )}
      </div>
      <div className="project-card__body">
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span className="project-card__num">GAME / {p.num}</span>
            <svg className="project-card__arrow" width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5h16M12 1l5 4-5 4" /></svg>
          </div>
          <h3 className="project-card__title">{p.title[lang]}</h3>
          <p className="project-card__sub">{p.subtitle[lang]}</p>
        </div>
        <div className="project-card__tags">
          {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </button>
  );

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ====== ШАПКА ====== */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid var(--line-strong)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
        <div className="wrap wrap--bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <a href="#top" className="display" style={{ fontSize: 20, textDecoration: "none", color: "var(--text)" }}>{copy.logo}</a>
          <nav className="nav-links-desk" style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <a href="#projects" className="nav-link">{copy.navProjects}</a>
            <a href="#about" className="nav-link">{copy.navAbout}</a>
            <a href="#contact" className="nav-link">{copy.navContact}</a>
          </nav>

          <div className="header-actions">
            {/* Кнопка настроек — внутри язык сайта */}
            <div className="settings-wrap" ref={settingsRef}>
              <button
                type="button"
                className={`gear-btn${settingsOpen ? " is-open" : ""}`}
                onClick={() => setSettingsOpen((v) => !v)}
                aria-label={copy.settingsAria}
                aria-expanded={settingsOpen}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {settingsOpen && (
                <div className="settings-panel" role="dialog" aria-label={copy.settings}>
                  <h3 className="settings-panel__title">{copy.settings}</h3>
                  <div className="settings-panel__label">{copy.language}</div>
                  <div className="lang-switch">
                    <button type="button" className={`lang-btn${lang === "ru" ? " is-on" : ""}`} onClick={() => setLang("ru")}>RU · Рус</button>
                    <button type="button" className={`lang-btn${lang === "en" ? " is-on" : ""}`} onClick={() => setLang("en")}>EN · Eng</button>
                  </div>
                  <p className="settings-panel__hint">{copy.langHint}</p>

                  {/* Кнопка редактора — появляется только после того,
                      как ты зашёл по секретному адресу (см. adminAccess.ts) */}
                  {isAdmin && (
                    <>
                      <div className="rule" style={{ margin: "14px 0 12px" }} />
                      <button type="button" className="lang-btn is-on" style={{ width: "100%" }}
                        onClick={() => { setEditorOpen(true); setSettingsOpen(false); }}>
                        {copy.editorBtn}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button type="button" className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={copy.themeAria}>
              <span className="theme-toggle__knob">
                {theme === "dark"
                  ? <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
                  : <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                }
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="top">

        {/* ====== ГЕРОЙ ====== */}
        <section className="wrap wrap--hero hero-grid">
          <div>
            <span className="mono" style={{ color: "var(--text-muted)" }}>{content.badge}</span>
            <h1 className="display" style={{ fontSize: "clamp(48px, 9vw, 110px)", margin: "16px 0 0" }}>
              {copy.firstName}<br />{copy.lastName}
            </h1>
            <p style={{ fontSize: 19, color: "var(--text-soft)", maxWidth: "46ch", marginTop: 24, lineHeight: 1.6 }}>{copy.heroBio}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <a href="#projects" className="contact-btn">
                {copy.viewWork}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </a>
              {/* Кнопка «написать» — только если почта заполнена (вкладка «Сайт») */}
              {content.email && <a href={`mailto:${content.email}`} className="contact-btn contact-btn--ghost">{copy.writeMe}</a>}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", border: "1px solid var(--text)", boxShadow: "8px 8px 0 var(--text)", overflow: "hidden", aspectRatio: "4/5" }}>
              <img src={content.portrait} alt={content.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1) contrast(1.05)" }} />
              {/* Подпись на портрете. Стили в index.css: плашка сама
                  затемняет то, что под ней, — читается на любом фоне. */}
              <div className="portrait__caption">
                <span className="mono">{copy.location}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====== ПРОЕКТЫ ====== */}
        <section id="projects" className="wrap">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>{copy.featured}</h2>
            {projects.length > 0 && <span className="mono" style={{ color: "var(--text-muted)" }}>{copy.clickHint}</span>}
          </div>
          <div className="rule" style={{ marginBottom: 32 }} />

          {/* Карточки строятся по списку проектов: сколько есть — столько
              и покажется. Удалил проект в settings.ts — блок просто исчез. */}
          <div className="project-grid">
            {projects.map((p, i) => (
              <div key={`${p.id}-${i}`} className={SPAN_PATTERN[i % SPAN_PATTERN.length]}>
                <Card p={p} i={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ====== ОБО МНЕ ====== */}
        <section id="about" className="wrap wrap--divided">
          <div className="rule section-rule" />
          <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>{copy.aboutTitle}</h2>
          <span className="mono" style={{ color: "var(--text-muted)", display: "block", marginTop: 12 }}>{copy.aboutSub}</span>
          <div className="about-text">
            {copy.about.filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>

        {/* ====== КОНТАКТЫ ====== */}
        <section id="contact" className="wrap wrap--contact wrap--divided">
          <div className="rule section-rule" />
          <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>{copy.contactTitle}</h2>
          <span className="mono" style={{ color: "var(--text-muted)", display: "block", marginTop: 12 }}>{copy.contactMe}</span>

          {/* Почта — только если она заполнена */}
          {content.email && (
            <a
              href={`mailto:${content.email}`}
              className="display"
              style={{ display: "block", fontSize: "clamp(28px, 6vw, 72px)", textDecoration: "none", color: "var(--text)", marginTop: 16, transition: "color 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            >
              {content.email}
            </a>
          )}

          {/* Контакты. Есть ссылка — открываем её, нет — копируем значение
              (у Discord, например, публичной ссылки на профиль не бывает). */}
          {content.contacts.length > 0 && (() => {
            const items = content.contacts
              .filter((c) => c.value.trim())
              .map((c) => ({ ...c, href: resolveUrl(c), service: detectService(c) }));
            if (!items.length) return null;

            return (
              <>
                {content.showContactHint && (
                  <p className="contacts__hint mono">
                    {items.some((c) => c.href) ? copy.contactsHint : copy.contactsCopy}
                  </p>
                )}
                <ul className="contacts">
                  {items.map((c, i) => {
                    const inner = (<>
                      <span className="contacts__brand" aria-hidden="true">
                        <ContactIcon service={c.service} />
                      </span>
                      <span className="contacts__text">
                        {c.label && <span className="contacts__label">{c.label}</span>}
                        <span className="contacts__value">{c.value}</span>
                      </span>
                      <span className="contacts__go" aria-hidden="true">
                        {c.href
                          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                      </span>
                    </>);

                    return (
                      <li key={i}>
                        {c.href ? (
                          <a className={`contacts__item contacts__item--${c.service}`} href={c.href} target="_blank" rel="noopener noreferrer"
                             title={copy.contactsHint}>
                            {inner}
                          </a>
                        ) : (
                          <button type="button" className={`contacts__item contacts__item--${c.service}`} title={copy.contactsCopy}
                            onClick={() => {
                              navigator.clipboard?.writeText(c.value).then(
                                () => { setCopied(c.value); window.setTimeout(() => setCopied(""), 1800); },
                                () => { /* браузер не дал доступ к буферу */ },
                              );
                            }}>
                            {inner}
                            {copied === c.value && <span className="contacts__copied">{copy.contactsCopied}</span>}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })()}

          <p style={{ color: "var(--text-soft)", fontSize: 17, marginTop: 20, maxWidth: "50ch" }}>{copy.contactNote}</p>
        </section>
      </main>

      {/* ====== ФУТЕР ====== */}
      <footer style={{ borderTop: "1px solid var(--line-strong)" }}>
        <div className="wrap wrap--foot" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} {content.name}</span>
          <span className="mono" style={{ color: "var(--text-muted)" }}>{copy.handmade}</span>
        </div>
      </footer>

      {/* ====== МОДАЛЬНОЕ ОКНО ====== */}
      {active && (
        <ProjectModal project={active} lang={lang} copy={copy} email={content.email} onClose={close} />
      )}

      {/* ====== РЕДАКТОР ПРОЕКТОВ (только когда тебя узнали) ====== */}
      {isAdmin && editorOpen && (
        <ProjectEditor
          projects={projects}
          setProjects={setProjects}
          content={content}
          setContent={setContent}
          lang={lang}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Доступ к редактору.
//
//  Первый раз — зайти по адресу сайта с  #секрет  (ADMIN_SECRET в settings.ts).
//  Дальше браузер помнит тебя: кнопка в меню-шестерёнке или Ctrl+Shift+E.
//  Выйти — открыть сайт с  #exit .
//
//  Вся проверка живёт в src/adminAccess.ts.
// ---------------------------------------------------------------------------
function useAdmin() {
  // Проверяем адрес один раз при загрузке страницы.
  const [access] = useState(() => checkAccessFromUrl());
  const [isAdmin, setIsAdmin] = useState(access.unlocked);
  const [editorOpen, setEditorOpen] = useState(access.openEditor);

  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        setEditorOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  // Если секретный адрес открыт в уже загруженной вкладке — реагируем сразу,
  // без перезагрузки. Из-за этого «сработало один раз и перестало» не повторится.
  useEffect(() => {
    const onHash = () => {
      const res = checkAccessFromUrl();
      setIsAdmin(res.unlocked);
      if (res.openEditor) setEditorOpen(true);
      if (!res.unlocked) setEditorOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return { isAdmin, editorOpen, setEditorOpen };
}
