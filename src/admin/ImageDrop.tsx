// ============================================================================
//   Поле для картинки: перетаскивание файла, Ctrl+V, выбор файла или ссылка.
//   Служебный файл редактора — трогать не нужно.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import {
  imageFileToDataUrl, imagesFromTransfer, urlFromTransfer,
} from "../projectsStore";

interface Props {
  label: string;
  value: string;
  onChange: (src: string) => void;
  hint: string;
  pickLabel: string;
  urlLabel: string;
  clearLabel: string;
  /** Круглый превью — для аватарок. */
  round?: boolean;
}

export default function ImageDrop({
  label, value, onChange, hint, pickLabel, urlLabel, clearLabel, round,
}: Props) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const accept = async (files: File[], fallbackUrl: string) => {
    if (files.length) {
      setBusy(true);
      try { onChange(await imageFileToDataUrl(files[0])); }
      finally { setBusy(false); }
    } else if (fallbackUrl) {
      onChange(fallbackUrl);
    }
  };

  // Ctrl+V работает, когда поле в фокусе или под курсором мыши.
  useEffect(() => {
    if (!focused) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = imagesFromTransfer(e.clipboardData);
      const url = urlFromTransfer(e.clipboardData);
      if (!files.length && !url) return;
      e.preventDefault();
      void accept(files, url);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [focused]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>

      <div
        ref={zoneRef}
        tabIndex={0}
        className={`ed-drop${over ? " is-over" : ""}${busy ? " is-busy" : ""}${focused ? " is-focused" : ""}`}
        onMouseEnter={() => setFocused(true)}
        onMouseLeave={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void accept(imagesFromTransfer(e.dataTransfer), urlFromTransfer(e.dataTransfer));
        }}
      >
        {value
          ? <img className={`ed-drop__preview${round ? " is-round" : ""}`} src={value} alt="" />
          : <span className="ed-drop__hint">{hint}</span>}

        {busy && <span className="ed-drop__busy" />}
      </div>

      <div className="ed-drop__actions">
        <button type="button" className="ed-btn ed-btn--sm" onClick={() => fileRef.current?.click()}>
          {pickLabel}
        </button>
        {value && (
          <button type="button" className="ed-btn ed-btn--sm ed-btn--danger" onClick={() => onChange("")}>
            {clearLabel}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void accept([f], "");
            e.target.value = "";
          }}
        />
      </div>

      <input
        className="ed-input ed-input--url"
        type="text"
        placeholder={urlLabel}
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
