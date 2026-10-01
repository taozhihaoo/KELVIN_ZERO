import { placeholderRoom, type Room } from './room';

// M0 placeholder — replaced in M3 by the black hole.
export function createHorizon(): Room {
  return placeholderRoom('r6', '#160404', '#050507');
}
