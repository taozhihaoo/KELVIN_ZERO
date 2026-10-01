// Minimal hash router: #/ · #/room/1..6 · #/index — back/forward supported.
export type Route =
  | { name: 'atrium' }
  | { name: 'room'; id: string }
  | { name: 'index' };

export function parseHash(hash: string): Route {
  const h = (hash || '#/').replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'room' && parts[1] && /^[1-6]$/.test(parts[1])) {
    return { name: 'room', id: parts[1] };
  }
  if (parts[0] === 'index') return { name: 'index' };
  return { name: 'atrium' };
}

export function routeKey(r: Route): string {
  if (r.name === 'room') return 'r' + r.id;
  return r.name; // 'atrium' | 'index'
}

export function routeHash(r: Route): string {
  if (r.name === 'room') return `#/room/${r.id}`;
  if (r.name === 'index') return '#/index';
  return '#/';
}

export function routeTitle(r: Route): string {
  if (r.name === 'atrium') return 'KELVIN ZERO — 零度美术馆';
  if (r.name === 'index') return 'INDEX — KELVIN ZERO 零度美术馆';
  const names: Record<string, string> = {
    '1': 'TURING / 图灵', '2': 'MERCURY / 水银', '3': 'CURL / 旋度',
    '4': 'LATTICE / 晶格', '5': 'ECHO / 回声', '6': 'HORIZON / 事件视界',
  };
  return `KELVIN ZERO — 00${r.id} ${names[r.id] ?? ''}`;
}

export class Router {
  private cbs = new Set<(r: Route) => void>();

  constructor() {
    window.addEventListener('hashchange', () => this.fire());
  }

  on(cb: (r: Route) => void): () => void {
    this.cbs.add(cb);
    return () => this.cbs.delete(cb);
  }

  private fire() {
    const r = this.current();
    this.cbs.forEach((cb) => cb(r));
  }

  current(): Route {
    return parseHash(location.hash);
  }

  go(hash: string) {
    if (location.hash === hash) this.fire();
    else location.hash = hash;
  }

  /** trigger listeners for the initial route */
  start() {
    this.fire();
  }
}
