import { placeholderRoom, type Room } from './room';

// M0 placeholder — replaced in M7 by the FFT waterfall instrument.
export function createEcho(): Room {
  return placeholderRoom('r5', '#161b0a', '#050507');
}
