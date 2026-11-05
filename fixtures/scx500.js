import { setChannel } from '../utils/dmx.js';
import { COLORS } from '../constants.js';

export const CHANNELS = {
  shutter: 0,
  dimmer: 1,
  color: 2,
  gobo: 3,
  pan: 4,
  tilt: 5,
  speed: 6,
};

// DMX-waarde op het kleurenwiel per kleur
const COLOR_VALUES = {
  [COLORS.RED]: 36,
  [COLORS.GREEN]: 168,
  [COLORS.BLUE]: 12,
};

export const START_ADDRESS = 100;

// Positie zoals bij Locate in MagicQ: pan en tilt op 50%
export function locate() {
  setChannel(START_ADDRESS, CHANNELS.pan, 128);
  setChannel(START_ADDRESS, CHANNELS.tilt, 128);     // Midden = recht naar boven
  setChannel(START_ADDRESS, CHANNELS.speed, 0);      // 0 = snelst
  setChannel(START_ADDRESS, CHANNELS.dimmer, 255);   // Vol open
  setChannel(START_ADDRESS, CHANNELS.shutter, 0);  // Open / geen strobe
}

export function setColor(color) {
  setChannel(START_ADDRESS, CHANNELS.color, COLOR_VALUES[color]);
}

// Zet de dimmer; value is 0 (uit) t/m 255 (vol)
export function setDimmer(value) {
  setChannel(START_ADDRESS, CHANNELS.dimmer, value);
}
