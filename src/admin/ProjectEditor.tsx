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
  type Lang, type Project, type ProjectStatus, type TextPair,
} from "../settings";
import {
  clearProjects, defaultProjects, download, imageFileToDataUrl,
  imagesFromTransfer, makeEmptyProject, saveProjects, toJson, toSettingsCode,
} from "../projectsStore";
import ImageDrop from "./ImageDrop";
import { ED } from "./editorTexts";
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
  lang: Lang;
  onClose: () => void;
}

export default function ProjectEditor({ projects, setProjects, lang, onClose }: Props) {
  // Тексты редактора живут в editorTexts.ts (см. комментарий в том файле).
  const t = ED[lang];
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState("");
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
    const base = defaultProjects();
    setProjects(base);
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
            <button type="button" className="ed-btn" onClick={copyCode}>{t.ed_copy}</button>
            <button type="button" className="ed-btn" onClick={() => download("projects.json", toJson(projects), "application/json")}>
              {t.ed_export}
            </button>
            <button type="button" className="ed-btn ed-btn--danger" onClick={resetAll}>{t.ed_reset}</button>
            <button type="button" className="ed-btn ed-btn--solid" onClick={onClose}>{t.ed_lock}</button>
          </div>
        </header>

        <p className="ed-note">{t.ed_localNote}</p>

        <div className="ed-body">

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
                <div className="ed-row4">
                  <Text label={t.ed_f_id}     value={current.id}     onChange={(id) => patch({ id })} />
                  <Text label={t.ed_f_num}    value={current.num}    onChange={(num) => patch({ num })} />
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

                <Text
                  label={t.ed_f_tags}
                  value={current.tags.join(", ")}
                  onChange={(v) => patch({ tags: v.split(",").map((t) => t.trim()).filter(Boolean) })}
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
                <Text label={t.ed_f_linkUrl}   value={current.linkUrl}   onChange={(linkUrl) => patch({ linkUrl })} />
                <Pair label={t.ed_f_linkLabel} value={current.linkLabel} onChange={(linkLabel) => patch({ linkLabel })} />

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
