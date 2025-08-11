import { useEffect, useMemo, useState } from 'react';
import { getSignedMemoryPhotoUrlTransformed, type ImageTransform } from '@/utils/getSignedMemoryPhotoUrl';

type Source = { src: string; width: number };

export function useResponsiveMemoryImage(storagePath?: string) {
  const [srcset, setSrcset] = useState<string>('');
  const [fallback, setFallback] = useState<string>('');

  const targets: ImageTransform[] = useMemo(
    () => [
      { width: 320, resize: 'cover', quality: 70 },
      { width: 480, resize: 'cover', quality: 70 },
      { width: 768, resize: 'cover', quality: 70 },
      { width: 1080, resize: 'cover', quality: 70 },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!storagePath) { setSrcset(''); setFallback(''); return; }
      const results = await Promise.all(targets.map(async (t) => {
        const url = await getSignedMemoryPhotoUrlTransformed(storagePath, t);
        return url ? { src: url, width: t.width || 0 } : null;
      }));
      if (cancelled) return;
      const sources: Source[] = results.filter(Boolean) as Source[];
      sources.sort((a, b) => a.width - b.width);
      const s = sources.map(s => `${s.src} ${s.width}w`).join(', ');
      setSrcset(s);
      // fallback is largest
      const last = sources[sources.length - 1];
      setFallback(last?.src || '');
    }
    run();
    return () => { cancelled = true; };
  }, [storagePath, targets]);

  return { srcset, fallback };
}

export function usePrefetchOnIntersect(urls: string[], rootMargin = '400px') {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const links: HTMLLinkElement[] = [];
    const controller = new AbortController();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          urls.forEach(u => {
            if (!u) return;
            const l = document.createElement('link');
            l.rel = 'prefetch';
            l.as = 'image';
            l.href = u;
            document.head.appendChild(l);
            links.push(l);
          });
          observer.disconnect();
        }
      });
    }, { rootMargin });
    const el = document.querySelector('[data-memory-grid]');
    if (el) observer.observe(el);
    return () => { observer.disconnect(); links.forEach(l => l.remove()); controller.abort(); };
  }, [urls, rootMargin]);
}
