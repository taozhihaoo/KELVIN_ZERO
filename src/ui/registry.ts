import type { Panel } from './panel';
import type { HUD } from './hud';

/** Set by main at boot — lets rooms reach shared UI without circular imports. */
export const registry = {
  panel: null as Panel | null,
  hud: null as HUD | null,
};
