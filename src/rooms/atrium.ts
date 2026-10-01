import { placeholderRoom, type Room } from './room';

// M0 placeholder — replaced in M8 by the real Atrium.
export function createAtrium(): Room {
  return placeholderRoom('atrium', '#10131c', '#050507');
}
