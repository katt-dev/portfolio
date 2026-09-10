// ============================================================================
//   РЕДАКТОР ПРОЕКТОВ — существует только при локальном запуске.
//
//   Как открыть:  npm run dev  ->  localhost:5173  ->  Ctrl+Shift+E
//   Как закрыть:  Esc или кнопка «Закрыть редактор».
//
//   В сборку для сайта этот файл не попадает (см. App.tsx).
//
//   Правки сохраняются в этот браузер сразу же. Чтобы они появились на сайте
//   у всех — нажми «Скопировать код для settings.ts» и вставь в settings.ts.
//
//   Служебный файл — трогать не нужно.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import {
  STATUS, STATUS_ORDER,
  CONTENT_PATH, PROJECTS_PATH,
  type ImageFit, type Lang, type Project, type ProjectStatus, type TextPair,
} from "../settings";
import {
  clearProjects, defaultProjects, download, imageFileToDataUrl,
  imagesFromTransfer, makeEmptyProject, saveProjects, toJson, toSettingsCode,
} from "../projectsStore";
import {
  FIELD_LABELS, contentToJson, defaultContent, clearContent, saveContent,
  type SiteContent, type UiBlock,
} from "../contentStore";
import ImageDrop from "./ImageDrop";
import ProjectModal from "../ProjectModal";
import { resolveUrl } from "../contacts";
import { ED } from "./editorTexts";
import { actionsUrl, getToken, maskToken, publishFiles, setToken } from "./publish";
import "./editor.css";

// ---------------------------------------------------------------------------
//  Маленькие переиспользуемые поля.
//  Объявлены СНАРУЖИ ProjectEditor: иначе React пересоздавал бы их на каждой
//  букве и поле теряло бы фокус после первого нажатия.
// ---------------------------------------------------------------------------

function Text({ label, value, onChange, area }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean;
}) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      {area
        ? <textarea className="ed-input ed-input--area" value={value} rows={4} onChange={(e) => onChange(e.target.value)} />
        : <input className="ed-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

// Теги хранятся массивом, но печатать их нужно строкой: держим сырой текст
// в своём состоянии, иначе только что набранная запятая исчезает при разборе.
function Tags({ label, value, onChange }: {
  label: string; value: string[]; onChange: (v: string[]) => void;
}) {
  const joined = value.join(", ");
  const [raw, setRaw] = useState(joined);

  useEffect(() => {
    setRaw((prev) =>
      prev.split(",").map((s) => s.trim()).filter(Boolean).join(", ") === joined ? prev : joined
    );
  }, [joined]);

  return (
    <Text
      label={label}
      value={raw}
      onChange={(v) => {
        setRaw(v);
        onChange(v.split(",").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

function Pair({ label, value, onChange, area }: {
  label: string; value: TextPair; onChange: (v: TextPair) => void; area?: boolean;
}) {
  return (
    <div className="ed-pair">
      <Text label={`${label} · RU`} value={value.ru} area={area} onChange={(ru) => onChange({ ...value, ru })} />
      <Text label={`${label} · EN`} value={value.en} area={area} onChange={(en) => onChange({ ...value, en })} />
    </div>
  );
}

interface Props {
  projects: Project[];
  setProjects: (p: Project[]) => void;
  content: SiteContent;
  setContent: (c: SiteContent) => void;
  lang: Lang;
  onClose: () => void;
}

export default function ProjectEditor({ projects, setProjects, content, setContent, lang, onClose }: Props) {
  // Тексты редактора живут в editorTexts.ts (см. комментарий в том файле).
  const t = ED[lang];
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState("");
  const [token, setTokenState] = useState(() => getToken());
  const [tokenDraft, setTokenDraft] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [lastCommit, setLastCommit] = useState("");
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<"projects" | "site">("projects");
  const toastTimer = useRef<number | undefined>(undefined);

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Любая правка сразу пишется в localStorage.
  const commit = (next: Project[]) => {
    setProjects(next);
    const res = saveProjects(next);
    if (!res.ok) {
      flash(lang === "ru"
        ? "Не удалось сохранить: не хватает места в браузере. Удали лишние вставленные картинки или используй ссылки."
        : "Could not save: browser storage is full. Remove some pasted images or use URLs instead.");
    }
  };

  const index = Math.min(selected, Math.max(0, projects.length - 1));
  const current: Project | undefined = projects[index];

  const patch = (changes: Partial<Project>) => {
    if (!current) return;
    commit(projects.map((p, i) => (i === index ? { ...p, ...changes } : p)));
  };

  const addProject = () => {
    const next = [...projects, makeEmptyProject(projects.length, t.ed_newProject)];
    commit(next);
    setSelected(next.length - 1);
  };

  const removeProject = (i: number) => {
    if (!window.confirm(t.ed_confirmDel)) return;
    const next = projects.filter((_, k) => k !== i);
    commit(next);
    setSelected(Math.max(0, Math.min(i, next.length - 1)));
  };

  const moveProject = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
    setSelected(j);
  };

  const resetAll = () => {
    if (!window.confirm(t.ed_confirmRes)) return;
    clearProjects();
    clearContent();
    setProjects(defaultProjects());
    setContent(defaultContent());
    setSelected(0);
    flash(t.ed_reset);
  };

  const copyCode = async () => {
    const code = toSettingsCode(projects);
    try {
      await navigator.clipboard.writeText(code);
      flash(t.ed_copied);
    } catch {
      download("projects-settings.ts.txt", code, "text/plain;charset=utf-8");
    }
  };

  const commitContent = (next: SiteContent) => {
    setContent(next);
    saveContent(next);
  };

  /** Правка одного поля текстов на одном языке. */
  const patchUi = (l: Lang, key: string, value: string | string[]) => {
    commitContent({
      ...content,
      ui: { ...content.ui, [l]: { ...content.ui[l], [key]: value } as UiBlock },
    });
  };

  const publish = async () => {
    setPublishing(true);
    setLastCommit("");
    const res = await publishFiles([
      { path: PROJECTS_PATH, content: toJson(projects) + "\n" },
      { path: CONTENT_PATH, content: contentToJson(content) },
    ], token, lang);
    setPublishing(false);
    if (res.commitUrl) setLastCommit(res.commitUrl);
    flash(res.message);
  };

  const saveToken = () => {
    const v = tokenDraft.trim();
    if (!v) return;
    setToken(v);
    setTokenState(v);
    setTokenDraft("");
    flash(t.ed_tokenSaved);
  };

  const clearToken = () => {
    setToken("");
    setTokenState("");
  };

  // Esc закрывает редактор.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ed-overlay" role="dialog" aria-modal="true" aria-label={t.ed_title}>
      <div className="ed-panel">

        {/* ---- шапка ---- */}
        <header className="ed-head">
          <h2 className="display ed-head__title">{t.ed_title}</h2>
          <div className="ed-head__actions">
            <button type="button" className="ed-btn ed-btn--publish" onClick={publish} disabled={publishing || !token}>
              {publishing ? t.ed_publishing : t.ed_publish}
            </button>
            <button type="button" className="ed-btn" onClick={copyCode}>{t.ed_copy}</button>
            <button type="button" className="ed-btn" onClick={() => download("projects.json", toJson(projects), "application/json")}>
              {t.ed_export}
            </button>
            <button type="button" className="ed-btn ed-btn--danger" onClick={resetAll}>{t.ed_reset}</button>
            <button type="button" className="ed-btn" onClick={() => setPreview(true)} disabled={!current}>
              {t.ed_preview}
            </button>
            <button type="button" className="ed-btn ed-btn--solid" onClick={onClose}>{t.ed_lock}</button>
          </div>
        </header>

        <p className="ed-note">{t.ed_publishNote}</p>

        {/* ---- токен для публикации ---- */}
        <div className="ed-token">
          {token ? (
            <div className="ed-token__row">
              <span className="ed-label">{t.ed_token}</span>
              <code className="ed-token__mask">{maskToken(token)}</code>
              <button type="button" className="ed-btn ed-btn--sm ed-btn--danger" onClick={clearToken}>
                {t.ed_tokenClear}
              </button>
              <a className="ed-btn ed-btn--sm" href={actionsUrl()} target="_blank" rel="noopener noreferrer">
                {t.ed_openActions}
              </a>
            </div>
          ) : (
            <div className="ed-token__row">
              <input
                className="ed-input ed-input--url"
                type="password"
                autoComplete="off"
                placeholder={t.ed_token}
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveToken(); }}
              />
              <button type="button" className="ed-btn ed-btn--sm ed-btn--solid" onClick={saveToken}>
                {t.ed_tokenSet}
              </button>
            </div>
          )}
          {!token && <p className="ed-note ed-note--tight">{t.ed_tokenHint}</p>}
          {lastCommit && (
            <p className="ed-note ed-note--tight">
              <a href={lastCommit} target="_blank" rel="noopener noreferrer">{lastCommit}</a>
            </p>
          )}
        </div>

        <div className="ed-tabs">
          <button type="button" className={`ed-tab${tab === "projects" ? " is-on" : ""}`}
            onClick={() => setTab("projects")}>{t.ed_tabProjects}</button>
          <button type="button" className={`ed-tab${tab === "site" ? " is-on" : ""}`}
            onClick={() => setTab("site")}>{t.ed_tabSite}</button>
        </div>

        {tab === "site" && (
          <section className="ed-form">
            <h3 className="ed-section">{t.ed_siteTitle}</h3>
            <div className="ed-row2">
              <Text label={t.ed_f_siteName} value={content.name}
                onChange={(name) => commitContent({ ...content, name })} />
              <Text label={t.ed_f_siteEmail} value={content.email}
                onChange={(email) => commitContent({ ...content, email })} />
            </div>
            <Text label={t.ed_f_badge} value={content.badge}
              onChange={(badge) => commitContent({ ...content, badge })} />
            <h3 className="ed-section">{t.ed_contacts}</h3>
            <p className="ed-hint">{t.ed_cHint}</p>
            <label className="ed-check">
              <input type="checkbox" checked={content.showContactHint}
                onChange={(e) => commitContent({ ...content, showContactHint: e.target.checked })} />
              <span>{t.ed_hintToggle}</span>
            </label>
            {content.contacts.map((c, i) => {
              const upd = (patchItem: Partial<typeof c>) =>
                commitContent({
                  ...content,
                  contacts: content.contacts.map((x, k) => (k === i ? { ...x, ...patchItem } : x)),
                });
              return (
                <div className="ed-sub" key={i}>
                  <div className="ed-sub__head">
                    <span className="ed-label">#{i + 1}</span>
                    <div className="ed-item__side">
                      <button type="button" className="ed-icon" title={t.ed_up} disabled={i === 0}
                        onClick={() => {
                          const next = [...content.contacts];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          commitContent({ ...content, contacts: next });
                        }}>&#8593;</button>
                      <button type="button" className="ed-icon" title={t.ed_down}
                        disabled={i === content.contacts.length - 1}
                        onClick={() => {
                          const next = [...content.contacts];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          commitContent({ ...content, contacts: next });
                        }}>&#8595;</button>
                      <button type="button" className="ed-icon ed-icon--danger" title={t.ed_remove}
                        onClick={() => commitContent({
                          ...content,
                          contacts: content.contacts.filter((_, k) => k !== i),
                        })}>&#10005;</button>
                    </div>
                  </div>
                  <div className="ed-row2">
                    <Text label={t.ed_f_cLabel} value={c.label} onChange={(label) => upd({ label })} />
                    <Text label={t.ed_f_cValue} value={c.value} onChange={(value) => upd({ value })} />
                  </div>
                  <Text label={t.ed_f_cUrl} value={c.url} onChange={(url) => upd({ url })} />
                  <span className="ed-hint">
                    {resolveUrl(c) || t.ed_f_cValue}
                  </span>
                </div>
              );
            })}
            <button type="button" className="ed-btn"
              onClick={() => commitContent({
                ...content,
                contacts: [...content.contacts, { label: "", value: "", url: "" }],
              })}>
              + {t.ed_addContact}
            </button>
            <ImageDrop
              label={t.ed_f_portrait}
              value={content.portrait}
              onChange={(portrait) => commitContent({ ...content, portrait })}
              hint={t.ed_dropHint}
              pickLabel={t.ed_pickFile}
              urlLabel={t.ed_f_src}
              clearLabel={t.ed_remove}
            />

            {/* Все надписи сайта. Порядок берём из content.json. */}
            {Object.keys(content.ui.ru).map((key) => {
              const label = FIELD_LABELS[key]?.[lang] ?? key;
              const ruVal = (content.ui.ru as Record<string, unknown>)[key];
              const enVal = (content.ui.en as Record<string, unknown>)[key];

              // «Обо мне» — список абзацев, редактируем построчно
              if (Array.isArray(ruVal)) {
                return (
                  <div className="ed-field" key={key}>
                    <span className="ed-label">{label}</span>
                    <div className="ed-pair">
                      <Text label="RU" area value={(ruVal as string[]).join("\n")}
                        onChange={(v) => patchUi("ru", key, v.split("\n"))} />
                      <Text label="EN" area value={(enVal as string[]).join("\n")}
                        onChange={(v) => patchUi("en", key, v.split("\n"))} />
                    </div>
                    <span className="ed-hint">{t.ed_aboutHint}</span>
                  </div>
                );
              }

              const long = String(ruVal).length > 60;
              return (
                <div className="ed-field" key={key}>
                  <span className="ed-label">{label}</span>
                  <div className="ed-pair">
                    <Text label="RU" area={long} value={String(ruVal)}
                      onChange={(v) => patchUi("ru", key, v)} />
                    <Text label="EN" area={long} value={String(enVal)}
                      onChange={(v) => patchUi("en", key, v)} />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <div className="ed-body" hidden={tab !== "projects"}>

          {/* ---- список проектов ---- */}
          <aside className="ed-list">
            <div className="ed-list__head">
              <span className="ed-label">{t.ed_projects}</span>
              <button type="button" className="ed-btn ed-btn--sm ed-btn--solid" onClick={addProject}>
                + {t.ed_new}
              </button>
            </div>

            {projects.length === 0 && <p className="ed-empty">{t.ed_empty}</p>}

            {projects.map((p, i) => (
              <div key={p.id + i} className={`ed-item${i === index ? " is-active" : ""}`}>
                <button type="button" className="ed-item__main" onClick={() => setSelected(i)}>
                  {p.cover
                    ? <img className="ed-item__thumb" src={p.cover} alt="" />
                    : <span className="ed-item__thumb ed-item__thumb--empty" />}
                  <span className="ed-item__text">
                    <span className="ed-item__title">{p.title[lang] || p.title.ru || p.id}</span>
                    <span className="ed-item__meta">
                      {[p.num, p.year, p.status ? STATUS[p.status][lang] : ""].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
                <div className="ed-item__side">
                  <button type="button" className="ed-icon" title={t.ed_up} onClick={() => moveProject(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" className="ed-icon" title={t.ed_down} onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1}>↓</button>
                  <button type="button" className="ed-icon ed-icon--danger" title={t.ed_delete} onClick={() => removeProject(i)}>✕</button>
                </div>
              </div>
            ))}
          </aside>

          {/* ---- форма ---- */}
          <section className="ed-form">
            {!current && <p className="ed-empty">{t.ed_empty}</p>}

            {current && (
              <>
                <h3 className="ed-section">{t.ed_fields}</h3>
                <div className="ed-row3">
                  <Text label={t.ed_f_id}     value={current.id}     onChange={(id) => patch({ id })} />
                  <Text label={t.ed_f_year}   value={current.year}   onChange={(year) => patch({ year })} />
                  <Text label={t.ed_f_engine} value={current.engine} onChange={(engine) => patch({ engine })} />
                </div>

                <label className="ed-field">
                  <span className="ed-label">{t.ed_f_status}</span>
                  <select
                    className="ed-input"
                    value={current.status}
                    onChange={(e) => patch({ status: e.target.value as ProjectStatus })}
                  >
                    <option value="">{t.ed_statusNone}</option>
                    {STATUS_ORDER.map((k) => (
                      <option key={k} value={k}>{STATUS[k][lang]}</option>
                    ))}
                  </select>
                </label>

                <label className="ed-field">
                  <span className="ed-label">{t.ed_f_fit}</span>
                  <select
                    className="ed-input"
                    value={current.imageFit}
                    onChange={(e) => patch({ imageFit: e.target.value as ImageFit })}
                  >
                    <option value="auto">{t.ed_fitAuto}</option>
                    <option value="custom">{t.ed_fitCustom}</option>
                  </select>
                  <span className="ed-hint">{t.ed_fitHint}</span>
                </label>

                <Tags
                  key={current.id}
                  label={t.ed_f_tags}
                  value={current.tags}
                  onChange={(tags) => patch({ tags })}
                />

                <ImageDrop
                  label={t.ed_f_cover}
                  value={current.cover}
                  onChange={(cover) => patch({ cover })}
                  hint={t.ed_dropHint}
                  pickLabel={t.ed_pickFile}
                  urlLabel={t.ed_f_src}
                  clearLabel={t.ed_remove}
                />

                <Pair label={t.ed_f_title}     value={current.title}     onChange={(title) => patch({ title })} />
                <Pair label={t.ed_f_subtitle}  value={current.subtitle}  onChange={(subtitle) => patch({ subtitle })} />
                <Pair label={t.ed_f_desc}      value={current.description} onChange={(description) => patch({ description })} area />
                <Pair label={t.ed_f_myRole}    value={current.myRole}    onChange={(myRole) => patch({ myRole })} />
                <h3 className="ed-section">{t.ed_links}</h3>
                <p className="ed-hint">{t.ed_linksHint}</p>
                {current.links.map((l, i) => (
                  <div className="ed-sub" key={i}>
                    <div className="ed-sub__head">
                      <span className="ed-label">#{i + 1}</span>
                      <div className="ed-item__side">
                        <button type="button" className="ed-icon" title={t.ed_up} disabled={i === 0}
                          onClick={() => {
                            const next = [...current.links];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            patch({ links: next });
                          }}>&#8593;</button>
                        <button type="button" className="ed-icon" title={t.ed_down} disabled={i === current.links.length - 1}
                          onClick={() => {
                            const next = [...current.links];
                            [next[i + 1], next[i]] = [next[i], next[i + 1]];
                            patch({ links: next });
                          }}>&#8595;</button>
                        <button type="button" className="ed-icon ed-icon--danger" title={t.ed_remove}
                          onClick={() => patch({ links: current.links.filter((_, k) => k !== i) })}>&#10005;</button>
                      </div>
                    </div>
                    <Text label={t.ed_f_linkUrl} value={l.url}
                      onChange={(url) => patch({ links: current.links.map((x, k) => (k === i ? { ...x, url } : x)) })} />
                    <Pair label={t.ed_f_linkLabel} value={l.label}
                      onChange={(label) => patch({ links: current.links.map((x, k) => (k === i ? { ...x, label } : x)) })} />
                  </div>
                ))}
                <button type="button" className="ed-btn"
                  onClick={() => patch({ links: [...current.links, { url: "", label: { ru: "", en: "" } }] })}>
                  + {t.ed_addLink}
                </button>

                {/* ---- скриншоты ---- */}
                <h3 className="ed-section">{t.ed_shots}</h3>
                <BulkDrop
                  hint={t.ed_dropHint}
                  onFiles={async (files) => {
                    const added = await Promise.all(files.map(imageFileToDataUrl));
                    patch({ images: [...current.images, ...added.map((src) => ({ src, caption: { ru: "", en: "" } }))] });
                  }}
                />
                {current.images.map((img, i) => (
                  <div className="ed-sub" key={i}>
                    <div className="ed-sub__head">
                      <span className="ed-label">#{i + 1}</span>
                      <div className="ed-item__side">
                        <button type="button" className="ed-icon" title={t.ed_up} disabled={i === 0}
                          onClick={() => {
                            const next = [...current.images];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            patch({ images: next });
                          }}>↑</button>
                        <button type="button" className="ed-icon" title={t.ed_down} disabled={i === current.images.length - 1}
                          onClick={() => {
                            const next = [...current.images];
                            [next[i + 1], next[i]] = [next[i], next[i + 1]];
                            patch({ images: next });
                          }}>↓</button>
                        <button type="button" className="ed-icon ed-icon--danger" title={t.ed_remove}
                          onClick={() => patch({ images: current.images.filter((_, k) => k !== i) })}>✕</button>
                      </div>
                    </div>
                    <ImageDrop
                      label={t.ed_f_src}
                      value={img.src}
                      onChange={(src) => patch({ images: current.images.map((x, k) => (k === i ? { ...x, src } : x)) })}
                      hint={t.ed_dropHint}
                      pickLabel={t.ed_pickFile}
                      urlLabel={t.ed_f_src}
                      clearLabel={t.ed_remove}
                    />
                    <Pair
                      label={t.ed_f_caption}
                      value={img.caption}
                      onChange={(caption) => patch({ images: current.images.map((x, k) => (k === i ? { ...x, caption } : x)) })}
                    />
                  </div>
                ))}
                <button type="button" className="ed-btn"
                  onClick={() => patch({ images: [...current.images, { src: "", caption: { ru: "", en: "" } }] })}>
                  + {t.ed_addShot}
                </button>

                {/* ---- команда ---- */}
                <h3 className="ed-section">{t.ed_team}</h3>
                {current.team.map((m, i) => (
                  <div className="ed-sub" key={i}>
                    <div className="ed-sub__head">
                      <span className="ed-label">#{i + 1}</span>
                      <button type="button" className="ed-icon ed-icon--danger" title={t.ed_remove}
                        onClick={() => patch({ team: current.team.filter((_, k) => k !== i) })}>✕</button>
                    </div>
                    <div className="ed-row2">
                      <Text label={t.ed_f_name} value={m.name}
                        onChange={(name) => patch({ team: current.team.map((x, k) => (k === i ? { ...x, name } : x)) })} />
                      <Text label={t.ed_f_email} value={m.email ?? ""}
                        onChange={(email) => patch({ team: current.team.map((x, k) => (k === i ? { ...x, email } : x)) })} />
                    </div>
                    <Pair label={t.ed_f_role} value={m.role}
                      onChange={(role) => patch({ team: current.team.map((x, k) => (k === i ? { ...x, role } : x)) })} />
                    <ImageDrop
                      label={t.ed_f_avatar}
                      value={m.avatar}
                      round
                      onChange={(avatar) => patch({ team: current.team.map((x, k) => (k === i ? { ...x, avatar } : x)) })}
                      hint={t.ed_dropHint}
                      pickLabel={t.ed_pickFile}
                      urlLabel={t.ed_f_src}
                      clearLabel={t.ed_remove}
                    />
                  </div>
                ))}
                <button type="button" className="ed-btn"
                  onClick={() => patch({ team: [...current.team, { name: "", role: { ru: "", en: "" }, avatar: "", email: "" }] })}>
                  + {t.ed_addMember}
                </button>
              </>
            )}
          </section>
        </div>

        {toast && <div className="ed-toast">{toast}</div>}
      </div>

      {/* Превью — тот же самый компонент, что и на сайте, поэтому
          показывает ровно то, что увидят посетители. */}
      {preview && current && (
        <ProjectModal
          project={current}
          lang={lang}
          copy={content.ui[lang]}
          email={content.email}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Большая зона «брось сюда сразу несколько скриншотов»
// ---------------------------------------------------------------------------

function BulkDrop({ hint, onFiles }: { hint: string; onFiles: (f: File[]) => Promise<void> }) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hot, setHot] = useState(false);

  const take = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    try { await onFiles(files); } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!hot) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = imagesFromTransfer(e.clipboardData);
      if (!files.length) return;
      e.preventDefault();
      void take(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [hot]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      tabIndex={0}
      className={`ed-drop ed-drop--bulk${over ? " is-over" : ""}${busy ? " is-busy" : ""}`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); void take(imagesFromTransfer(e.dataTransfer)); }}
    >
      <span className="ed-drop__hint">{hint}</span>
      {busy && <span className="ed-drop__busy" />}
    </div>
  );
}
