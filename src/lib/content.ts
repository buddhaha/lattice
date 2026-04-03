import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

type ContentItem = {
  title?: string;
  date: string;
  type: string;
  body: string;
  slug: string;
  modifiedTime: string;
  nodes?: string[];
  tags?: string[];
};

function normalizeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '');
}

export function readContentDir(dir: string, fallbackType: string): ContentItem[] {
  const dirPath = path.resolve('content', dir);
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath)
    .filter((f: string) => !f.startsWith('.'))
    .map((f: string) => {
      const filepath = path.join(dirPath, f);
      if (!fs.statSync(filepath).isFile()) return null;
      const raw = fs.readFileSync(filepath, 'utf-8');
      const stat = fs.statSync(filepath);
      const modifiedTime = `${String(stat.mtime.getHours()).padStart(2, '0')}:${String(stat.mtime.getMinutes()).padStart(2, '0')}`;
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!fmMatch) return null;
      const fm = yaml.load(fmMatch[1]) as Record<string, unknown>;
      const body = fmMatch[2].trim();
      const normalizedType = String(fm.type || fallbackType).toUpperCase();
      return {
        ...fm,
        date: normalizeDate(fm.date),
        type: normalizedType,
        body,
        slug: f.replace(/\.md$/, ''),
        modifiedTime,
      } as ContentItem;
    })
    .filter(Boolean) as ContentItem[];
}

export function readSortedContentDir(dir: string, fallbackType: string) {
  return readContentDir(dir, fallbackType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string) {
  return readSortedContentDir('articles', 'ARTICLE').find((item) => item.slug === slug);
}
