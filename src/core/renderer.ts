import * as THREE from 'three';

export function hasWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.setSize(window.innerWidth, window.innerHeight);
  r.toneMapping = THREE.NoToneMapping; // OutputPass handles tonemap/sRGB
  r.setClearColor(0x050507, 1);
  return r;
}

export function drawingSize(r: THREE.WebGLRenderer): THREE.Vector2 {
  return r.getDrawingBufferSize(new THREE.Vector2());
}
