// ============================================================================
//   ОКНО ПРОЕКТА
//
//   Один и тот же компонент используется в двух местах:
//     1) на сайте, когда посетитель нажимает на карточку;
//     2) в редакторе, кнопка «Превью окна».
//
//   Благодаря этому превью показывает ровно то, что увидят люди, —
//   разойтись они не могут в принципе.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { STATUS, type Lang, type Project } from "./settings";
import type { UiBlock } from "./contentStore";
import { detectService } from "./contacts";
import ContactIcon from "./ContactIcon";

interface Props {
  project: Project;
  lang: Lang;
  copy: UiBlock;
  /** Почта из настроек сайта. Пусто -> кнопка «написать» не показывается. */
  email: string;
  onClose: () => void;
}

export default function ProjectModal({ project, lang, copy, email, onClose }: Props) {
  const [slide, setSlide] = useState(0);
  const [mailCopied, setMailCopied] = useState(false);

  // «Скопировано» гаснет само.
  useEffect(() => {
    if (!mailCopied) return;
    const id = window.setTimeout(() => setMailCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [mailCopied]);

  // Проект сменился — показываем первый скриншот.
  useEffect(() => { setSlide(0); }, [project.id]);

  // Если скриншот удалили в редакторе, а он был открыт — не улетаем в пустоту.
  useEffect(() => {
    if (slide > project.images.length - 1) setSlide(0);
  }, [project.images.length, slide]);

  const prev = useCallback(() => {
    setSlide((s) => (s === 0 ? project.images.length - 1 : s - 1));
  }, [project.images.length]);
  const next = useCallback(() => {
    setSlide((s) => (s === project.images.length - 1 ? 0 : s + 1));
  }, [project.images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  /** Если подпись не заполнена — показываем домен, чтобы кнопка не была пустой. */
  const hostOf = (url: string) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  };

  const mailSubject = (title: string) =>
    lang === "ru"
      ? `Проект «${title}» — вопрос через сайт`
      : `Project “${title}” — message from the site`;

  return (
      <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="modal__close" onClick={onClose} aria-label={copy.close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>

          <div className="modal__inner">
            <div className="modal__media">
              <div className={`carousel carousel--${project.imageFit}`}>
                <div className="carousel__track" style={{ transform: `translateX(${-slide * 100}%)` }}>
                  {project.images.map((img, i) => (
                    <div className="carousel__slide" key={i}>
                      <img className="carousel__img" src={img.src} alt={img.caption[lang]} />
                      {img.caption[lang] && <span className="carousel__caption">{img.caption[lang]}</span>}
                    </div>
                  ))}
                </div>
                {project.images.length > 1 && (<>
                  <button type="button" className="carousel__nav carousel__nav--prev" onClick={prev} aria-label="←">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button type="button" className="carousel__nav carousel__nav--next" onClick={next} aria-label="→">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  <div className="carousel__dots">
                    {project.images.map((_, i) => (
                      <button key={i} type="button" className={`carousel__dot${i === slide ? " carousel__dot--active" : ""}`} onClick={() => setSlide(i)} />
                    ))}
                  </div>
                </>)}
              </div>
              {project.images.length > 1 && (
                <div className="carousel__thumbs">
                  {project.images.map((img, i) => (
                    <img key={i} src={img.src} alt="" className={`carousel__thumb${i === slide ? " carousel__thumb--active" : ""}`} onClick={() => setSlide(i)} />
                  ))}
                </div>
              )}

              {/* Полное описание — под скриншотами, во всю ширину левой колонки */}
              {project.description[lang] && (
                <div className="modal__desc">
                  <p>{project.description[lang]}</p>
                </div>
              )}
            </div>

            <div className="modal__info">
              <div>
                <span className="meta-label">{[project.year, project.engine].filter(Boolean).join(" · ")}</span>
                <h2 className="display" style={{ fontSize: "clamp(30px, 4vw, 46px)", margin: "8px 0 6px" }}>{project.title[lang]}</h2>
                {project.subtitle[lang] && <p style={{ color: "var(--text-soft)", fontSize: 16, margin: 0 }}>{project.subtitle[lang]}</p>}
              </div>

              {/* Стадия проекта — только если указана */}
              {project.status && (
                <div className="meta-row">
                  <span className="meta-label">{copy.statusLabel}</span>
                  <span className={`status-chip status-chip--${project.status}`}>{STATUS[project.status][lang]}</span>
                </div>
              )}

              <div className="rule" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {project.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>

              {/* Команда — показываем блок, только если кто-то есть */}
              {project.team.length > 0 && (<>
                <div className="rule" />
                <div>
                  <span className="meta-label">{copy.teamLabel}</span>
                  <div style={{ marginTop: 10 }}>
                    {project.team.map((c) => (
                      <div className="collab" key={c.name}>
                        {/* Нет аватарки — показываем пустой круг вместо картинки */}
                        {c.avatar
                          ? <img className="collab__avatar" src={c.avatar} alt={c.name} loading="lazy" />
                          : <span className="collab__avatar collab__avatar--empty" aria-hidden="true" />}
                        <div>
                          <div className="collab__name">{c.name}</div>
                          <div className="collab__role">{c.role[lang]}</div>
                        </div>
                        {/* Почта не указана — кнопки нет */}
                        {c.email && (
                          <a
                            className="collab__mail"
                            href={`mailto:${c.email}?subject=${encodeURIComponent(mailSubject(project.title[lang]))}`}
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
              <div className="meta-row">
                <span className="meta-label">{copy.roleLabel}</span>
                <span className="meta-value">{project.myRole[lang]}</span>
              </div>

              {/* Кнопки площадок: Steam, itch.io, свой сайт — что добавишь,
                  то и покажется. Подпись у каждой своя. */}
              {project.links.map((l, i) => {
                // Значок и цвет подбираются по ссылке и подписи — те же самые,
                // что и у плашек контактов. Незнакомая ссылка получит цепочку.
                const service = detectService({ label: l.label[lang], value: l.url, url: l.url });
                return (
                  <a key={i} className={`contact-btn contact-btn--link brand-${service}`} href={l.url} target="_blank" rel="noopener noreferrer">
                    <span className="contact-btn__icon" aria-hidden="true"><ContactIcon service={service} /></span>
                    {l.label[lang] || hostOf(l.url)}
                  </a>
                );
              })}

              {/* «Написать руководителю» — только если почта заполнена.

                  Ссылка mailto: открывает почтовую программу, но если в системе
                  такой программы не назначено, браузер молча ничего не делает —
                  кнопка выглядит сломанной. Поэтому по клику адрес заодно
                  копируется в буфер: реакция есть в любом случае. */}
              {email && (
                <a
                  className="contact-btn contact-btn--mail"
                  href={`mailto:${email}?subject=${encodeURIComponent(mailSubject(project.title[lang]))}`}
                  title={email}
                  onClick={() => {
                    navigator.clipboard?.writeText(email).then(
                      () => setMailCopied(true),
                      () => { /* браузер не дал доступ к буферу */ },
                    );
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 8l-10 6L2 8"/></svg>
                  {copy.mailBtn}
                  {mailCopied && <span className="contacts__copied">{copy.contactsCopied}</span>}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
