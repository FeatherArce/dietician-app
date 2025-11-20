import type { FormValues } from "./types";

// 路徑輔助函數
export function pathToString(path: string | (string | number)[]): string {
  return typeof path === "string" ? path : path.join(".");
}

export function getNestedValue(
  obj: FormValues,
  path?: string | (string | number)[]
): unknown {
  if (!path || path === undefined || path === null) {
    return undefined;
  }
  if (typeof path === "string") {
    if (path.includes(".")) {
      const keys = path.split(".");
      let current: unknown = obj;
      for (const key of keys) {
        if (current == null || typeof current !== "object") {
          return undefined;
        }
        current = (current as Record<string, unknown>)[key];
      }
      return current;
    }
    return obj[path];
  }

  let current: unknown = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

export function setNestedValue(
  obj: FormValues,
  path: string | (string | number)[],
  value: unknown
): FormValues {
  const newObj = { ...obj };

  if (typeof path === "string") {
    if (path.includes(".")) {
      const keys = path.split(".");
      let current: Record<string, unknown> = newObj;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];

        if (!current[key]) {
          current[key] = /^\d+$/.test(nextKey) ? [] : {};
        }
        current = current[key] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
    } else {
      newObj[path] = value;
    }
    return newObj;
  }

  let current: Record<string | number, unknown> = newObj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string | number, unknown>;
  }
  current[path[path.length - 1]] = value;
  return newObj;
}
