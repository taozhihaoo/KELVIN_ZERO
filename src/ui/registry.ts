import type { Panel } from './panel';

/** Set by main at boot — lets rooms reach shared UI without circular imports. */
export const registry = {
  panel: null as Panel | null,
};
