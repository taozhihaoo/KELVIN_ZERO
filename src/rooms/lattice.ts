import { placeholderRoom, type Room } from './room';

// M0 placeholder — replaced in M6 by the instanced lattice field.
export function createLattice(): Room {
  return placeholderRoom('r4', '#171a20', '#050507');
}
