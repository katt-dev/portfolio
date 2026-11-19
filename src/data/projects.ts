// Типы и доступ к проектам. Сами данные лежат в projects.json — их правит локальный редактор (npm run editor).
import raw from './projects.json';
import siteRaw from './site.json';

export type WallTheme = 'cartography' | 'gothic' | 'concrete' | 'sandstone' | 'sonar' | 'chrome';

export interface ProjectImage {
  src: string;
  thumb: string;
  width: number;
  height: number;
  alt: string;
  /** screenshot — кадр из игры, art — арт/логотип, cover — обложка-заглушка */
  kind: 'screenshot' | 'art' | 'cover';
}

export interface ProjectSystem {
  title: string;
  task: string;
  approach: string;
  result: string;
  image?: string;
}

export interface ProjectModel {
  /** путь к .glb в public/ */
  src: string;
  label: string;
  /** часть имени анимации покоя */
  idle?: string;
  /** часть имени анимации действия по кнопке */
  action?: string;
  actionLabel?: string;
  note?: string;
}

export interface Project {
  id: string;
  hidden: boolean;
  featured: boolean;
  /** Демонстрационный проект (не реальная работа) — помечается на сайте */
  demo: boolean;
  title: string;
  genre: string;
  status: string;
  year: string;
  engine: string;
  platform: string;
  role: string;
  tagline: string;
  overview: string;
  contribution: string[];
  technologies: string[];
  systems: ProjectSystem[];
  media: ProjectImage[];
  /** индекс обложки в media, -1 — тематический постер вместо изображения */
  cover: number;
  team: { name: string; role: string }[];
  studio: string;
  links: { label: string; url: string }[];
  wall: WallTheme;
  devNote: string;
  /** 3D-модели из игры для страницы проекта (необязательно) */
  models?: ProjectModel[];
}

export interface SiteLink {
  label: string;
  value: string;
  url: string;
  copy?: string;
}

export type SiteConfig = typeof siteRaw & { links: SiteLink[] };

export const site = siteRaw as SiteConfig;

const all = raw as Project[];

/** Проекты, видимые на сайте, в порядке из редактора */
export const projects: Project[] = all.filter((p) => !p.hidden);

export function getProject(id: string | null | undefined): Project | undefined {
  return id ? projects.find((p) => p.id === id) : undefined;
}

export function projectIndex(id: string): number {
  return projects.findIndex((p) => p.id === id);
}

export function coverOf(p: Project): ProjectImage | undefined {
  return p.cover >= 0 ? p.media[p.cover] : undefined;
}

export function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
