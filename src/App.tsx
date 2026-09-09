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
//   РЕДАКТОР ПРОЕКТОВ существует только у тебя на компьютере:
//   запусти  npm run dev  и нажми Ctrl+Shift+E. В версию, которая
//   выкладывается на сайт, код редактора не попадает вообще.
//
// ============================================================================

import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import {
  NAME, EMAIL, DISCORD, BADGE, PORTRAIT,
  UI, STATUS,
  type Lang, type UiText, type Project,
} from "./settings";
import { loadProjects } from "./projectsStore";

// Редактор проектов подгружается ТОЛЬКО при локальном запуске (npm run dev).
// В сборке для сайта import.meta.env.DEV === false, ветка становится мёртвым
// кодом, и Vite вырезает и её, и весь код редактора из итогового файла.
// То есть на GitHub Pages редактора не существует вообще — не только кнопки,
// а самого кода. Найти или открыть его снаружи невозможно.
const ProjectEditor = import.meta.env.DEV
  ? lazy(() => import("./admin/ProjectEditor"))
  : null;

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
  const settingsRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [active, setActive] = useState<Project | null>(null);
  const [slide, setSlide] = useState(0);

  const { editorOpen, setEditorOpen } = useAdmin();

  const copy: UiText = UI[lang];

  // ---------- сайд-эффекты ----------
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
    // Название вкладки браузера — меняется вместе с языком (см. tabTitle в settings.ts)
    document.title = UI[lang].tabTitle;
  }, [lang]);

  const open = (p: Project) => { setActive(p); setSlide(0); setSettingsOpen(false); };
  const close = () => setActive(null);

  const prev = useCallback(() => {
    if (!active) return;
    setSlide((s) => (s === 0 ? active.images.length - 1 : s - 1));
  }, [active]);
  const next = useCallback(() => {
    if (!active) return;
    setSlide((s) => (s === active.images.length - 1 ? 0 : s + 1));
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (active) close();
        else setSettingsOpen(false);
      }
      if (active) {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, prev, next]);

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
      <div className="project-card__cover">
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

  const mailSubject = (title: string) =>
    lang === "ru"
      ? `Проект «${title}» — вопрос через сайт`
      : `Project “${title}” — message from the site`;

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ====== ШАПКА ====== */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid var(--line-strong)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
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
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 40px" }} className="hero-grid">
          <div>
            <span className="mono" style={{ color: "var(--text-muted)" }}>{BADGE}</span>
            <h1 className="display" style={{ fontSize: "clamp(48px, 9vw, 110px)", margin: "16px 0 0" }}>
              {copy.firstName}<br />{copy.lastName}
            </h1>
            <p style={{ fontSize: 19, color: "var(--text-soft)", maxWidth: "46ch", marginTop: 24, lineHeight: 1.6 }}>{copy.heroBio}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <a href="#projects" className="contact-btn">
                {copy.viewWork}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </a>
              {/* Кнопка «написать» — только если EMAIL заполнен в settings.ts */}
              {EMAIL && <a href={`mailto:${EMAIL}`} className="contact-btn contact-btn--ghost">{copy.writeMe}</a>}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", border: "1px solid var(--text)", boxShadow: "8px 8px 0 var(--text)", overflow: "hidden", aspectRatio: "4/5" }}>
              <img src={PORTRAIT} alt={NAME} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1) contrast(1.05)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", background: "linear-gradient(transparent, #000a)", color: "#fff" }}>
                <span className="mono">{copy.location}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====== ПРОЕКТЫ ====== */}
        <section id="projects" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
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
        <section id="about" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px" }}>
          <div className="rule" style={{ marginBottom: 40 }} />
          <div className="about-grid">
            <div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>{copy.aboutTitle}</h2>
              <span className="mono" style={{ color: "var(--text-muted)", display: "block", marginTop: 12 }}>{copy.aboutSub}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--text-soft)", fontSize: 17, lineHeight: 1.7 }}>
              {copy.about.filter(Boolean).map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
            </div>
          </div>
        </section>

        {/* ====== КОНТАКТЫ ====== */}
        <section id="contact" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px 64px" }}>
          <div className="rule" style={{ marginBottom: 40 }} />
          <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: 0 }}>{copy.contactTitle}</h2>
          <span className="mono" style={{ color: "var(--text-muted)", display: "block", marginTop: 12 }}>{copy.contactMe}</span>

          {/* Почта — только если EMAIL заполнен */}
          {EMAIL && (
            <a
              href={`mailto:${EMAIL}`}
              className="display"
              style={{ display: "block", fontSize: "clamp(28px, 6vw, 72px)", textDecoration: "none", color: "var(--text)", marginTop: 16, transition: "color 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            >
              {EMAIL}
            </a>
          )}

          {DISCORD && <p style={{ color: "var(--text-muted)", marginTop: 16, whiteSpace: "pre-line" }} className="mono">{DISCORD}</p>}
          <p style={{ color: "var(--text-soft)", fontSize: 17, marginTop: 20, maxWidth: "50ch" }}>{copy.contactNote}</p>
        </section>
      </main>

      {/* ====== ФУТЕР ====== */}
      <footer style={{ borderTop: "1px solid var(--line-strong)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} {NAME}</span>
          <span className="mono" style={{ color: "var(--text-muted)" }}>{copy.handmade}</span>
        </div>
      </footer>

      {/* ====== МОДАЛЬНОЕ ОКНО ====== */}
      {active && (
        <div className="modal-overlay" onClick={close} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal__close" onClick={close} aria-label={copy.close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            <div className="modal__inner">
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div className="carousel">
                  <div className="carousel__track" style={{ transform: `translateX(${-slide * 100}%)` }}>
                    {active.images.map((img, i) => (
                      <div className="carousel__slide" key={i}>
                        <img className="carousel__img" src={img.src} alt={img.caption[lang]} />
                        {img.caption[lang] && <span className="carousel__caption">{img.caption[lang]}</span>}
                      </div>
                    ))}
                  </div>
                  {active.images.length > 1 && (<>
                    <button type="button" className="carousel__nav carousel__nav--prev" onClick={prev} aria-label="←">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button type="button" className="carousel__nav carousel__nav--next" onClick={next} aria-label="→">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                    <div className="carousel__dots">
                      {active.images.map((_, i) => (
                        <button key={i} type="button" className={`carousel__dot${i === slide ? " carousel__dot--active" : ""}`} onClick={() => setSlide(i)} />
                      ))}
                    </div>
                  </>)}
                </div>
                {active.images.length > 1 && (
                  <div className="carousel__thumbs">
                    {active.images.map((img, i) => (
                      <img key={i} src={img.src} alt="" className={`carousel__thumb${i === slide ? " carousel__thumb--active" : ""}`} onClick={() => setSlide(i)} />
                    ))}
                  </div>
                )}
              </div>

              <div className="modal__info">
                <div>
                  <span className="project-card__num">GAME / {active.num} · {active.year} · {active.engine}</span>
                  <h2 className="display" style={{ fontSize: "clamp(30px, 4vw, 46px)", margin: "8px 0 6px" }}>{active.title[lang]}</h2>
                  {active.subtitle[lang] && <p style={{ color: "var(--text-soft)", fontSize: 16, margin: 0 }}>{active.subtitle[lang]}</p>}
                </div>

                {/* Стадия проекта — только если указана */}
                {active.status && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span className="project-card__num">{copy.statusLabel}</span>
                    <span className={`status-chip status-chip--${active.status}`}>{STATUS[active.status][lang]}</span>
                  </div>
                )}

                <div className="rule" />
                {active.description[lang] && (
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-soft)", margin: 0 }}>{active.description[lang]}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {active.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>

                {/* Команда — показываем блок, только если кто-то есть */}
                {active.team.length > 0 && (<>
                  <div className="rule" />
                  <div>
                    <span className="project-card__num">{copy.teamLabel}</span>
                    <div style={{ marginTop: 10 }}>
                      {active.team.map((c) => (
                        <div className="collab" key={c.name}>
                          {/* Нет аватарки — просто не показываем её */}
                          {c.avatar && <img className="collab__avatar" src={c.avatar} alt={c.name} loading="lazy" />}
                          <div>
                            <div className="collab__name">{c.name}</div>
                            <div className="collab__role">{c.role[lang]}</div>
                          </div>
                          {/* Почта не указана — кнопки нет */}
                          {c.email && (
                            <a
                              className="collab__mail"
                              href={`mailto:${c.email}?subject=${encodeURIComponent(mailSubject(active.title[lang]))}`}
                              title={copy.mailBtn}
                              aria-label={`${copy.mailBtn}: ${c.name}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 8l-10 6L2 8"/></svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>)}

                <div className="rule" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <span className="project-card__num">{copy.roleLabel}</span>
                  <span style={{ fontWeight: 500 }}>{active.myRole[lang]}</span>
                </div>

                {/* Кнопка со ссылкой на игру / страницу в Steam.
                    Показывается только если в settings.ts заполнено linkUrl */}
                {active.linkUrl && (
                  <a className="contact-btn contact-btn--link" href={active.linkUrl} target="_blank" rel="noopener noreferrer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                    {active.linkLabel[lang]}
                  </a>
                )}

                {/* «Написать руководителю» — только если почта заполнена */}
                {EMAIL && (
                  <a className="contact-btn" href={`mailto:${EMAIL}?subject=${encodeURIComponent(mailSubject(active.title[lang]))}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 8l-10 6L2 8"/></svg>
                    {copy.mailBtn}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== РЕДАКТОР ПРОЕКТОВ (только при npm run dev) ====== */}
      {ProjectEditor && editorOpen && (
        <Suspense fallback={null}>
          <ProjectEditor
            projects={projects}
            setProjects={setProjects}
            lang={lang}
            onClose={() => setEditorOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Доступ к редактору.
//
//  Редактор доступен ТОЛЬКО при локальном запуске у тебя на компьютере:
//      npm run dev      ->  http://localhost:5173
//
//  Открыть/закрыть — Ctrl+Shift+E или кнопка в меню-шестерёнке.
//
//  На опубликованном сайте isAdmin всегда false, а сам код редактора в сборку
//  не попадает. Поэтому посторонний не может ни открыть его, ни узнать о нём:
//  подбирать адрес или горячую клавишу бесполезно, там этого кода нет.
// ---------------------------------------------------------------------------
function useAdmin() {
  const isAdmin: boolean = import.meta.env.DEV;
  const [editorOpen, setEditorOpen] = useState(false);

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

  return { editorOpen, setEditorOpen };
}
