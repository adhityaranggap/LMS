import { useState, useEffect } from 'react';
import { syllabusData } from '../data/syllabus-data';
import { cryptoSyllabusData } from '../data/crypto-syllabus-data';
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

const allModulesData = [...syllabusData, ...cryptoSyllabusData];

export function useModuleContent(moduleId: number): { module: ModuleData | null; loading: boolean } {
  const base = allModulesData.find(m => m.id === moduleId) ?? null;
  const [module, setModule] = useState<ModuleData | null>(base);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!base) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    api<{ override: DeepPartial<ModuleData> | null }>(`/api/content/${moduleId}`)
      .then(data => {
        if (cancelled) return;
        if (data.override) {
          setModule(deepMerge(base, data.override));
        } else {
          setModule(base);
        }
      })
      .catch(() => {
        if (!cancelled) setModule(base);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  return { module, loading };
}
