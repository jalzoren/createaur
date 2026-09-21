import type { ChatConfig } from '../types';
import { SCHEMA_VERSION } from '../types';
import { defaultConfig } from './defaults';
import { validateConfig } from './validate';

/**
 * Forward-only migration for persisted chat configs. A payload that fails
 * validation at any step falls back to defaults — never throws, never
 * white-screens the app.
 */
export function migrate(persisted: unknown, fromVersion: number): ChatConfig {
  try {
    let payload = unwrap(persisted);

    if (fromVersion < 1) {
      payload = migrateToV1(payload);
    }

    const check = validateConfig(payload);
    if (check.ok) return check.config;
    return defaultConfig();
  } catch {
    return defaultConfig();
  }
}

/** A v0 payload is whatever the app stored before schemas existed: validate it. */
function migrateToV1(data: unknown): unknown {
  return data;
}

/** Some carriers wrapped the config (e.g. a project file). Unwrap if present. */
function unwrap(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    if (record.config !== undefined) return record.config;
  }
  return data;
}

export { SCHEMA_VERSION };