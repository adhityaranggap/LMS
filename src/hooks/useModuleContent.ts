import { useState, useEffect } from 'react';
import type { ModuleData } from '../data/syllabus-data';
import { api } from '../lib/api';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const result = { ...base } as T;
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideVal = override[key];
    if (overrideVal === undefined) continue;
    const baseVal = base[key];
    if (
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal as object, overrideVal as object) as T[keyof T];
    } else {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}

// Lazy-load course data on demand (code splitting)
let cachedSyllabusData: ModuleData[] | null = null;
let cachedCryptoData: ModuleData[] | null = null;

async function loadCourseData(moduleId: number): Promise<ModuleData | null> {
  const isCrypto = moduleId >= 100;
  if (isCrypto) {
    if (!cachedCryptoData) {
      const mod = await import('../data/crypto-syllabus-data');
      cachedCryptoData = mod.cryptoSyllabusData;
    }
    return cachedCryptoData.find(m => m.id === moduleId) ?? null;
  } else {
    if (!cachedSyllabusData) {
      const mod = await import('../data/syllabus-data');
      cachedSyllabusData = mod.syllabusData;
    }
    return cachedSyllabusData.find(m => m.id === moduleId) ?? null;
  }
}

export function useModuleContent(moduleId: number): { module: ModuleData | null; loading: boolean } {
  const [module, setModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const base = await loadCourseData(moduleId);
        if (cancelled) return;

        if (!base) {
          setModule(null);
          setLoading(false);
          return;
        }

        // Try to load content override
        try {
          const data = await api<{ override: DeepPartial<ModuleData> | null }>(`/api/content/${moduleId}`);
          if (cancelled) return;
          setModule(data.override ? deepMerge(base, data.override) : base);
        } catch {
          if (!cancelled) setModule(base);
        }
      } catch {
        if (!cancelled) setModule(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [moduleId]);

  return { module, loading };
}
