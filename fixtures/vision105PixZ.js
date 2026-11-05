import { setChannel } from '../utils/dmx.js';
import { convertColorToRgb } from '../utils/colors.js';

export const CHANNELS = {
  pan: 0,
  panFine: 1,
  tilt: 2,
  tiltFine: 3,
  speed: 4,
  dimmer: 5,
  shutter: 6,
  red: 7,
  green: 8,
  blue: 9,
  white: 10,
  zoom: 11,
};

export const START_ADDRESS = 1;

// Positie zoals bij Locate in MagicQ: pan en tilt op 50%
export function locate() {
  setChannel(START_ADDRESS, CHANNELS.pan, 128);
  setChannel(START_ADDRESS, CHANNELS.panFine, 0);
  setChannel(START_ADDRESS, CHANNELS.tilt, 128);     // Midden = recht naar boven
  setChannel(START_ADDRESS, CHANNELS.tiltFine, 0);
  setChannel(START_ADDRESS, CHANNELS.speed, 0);      // 0 = snelst
  setChannel(START_ADDRESS, CHANNELS.dimmer, 255);   // Vol open
  setChannel(START_ADDRESS, CHANNELS.shutter, 255);  // Open / geen strobe
}

// Zet de kleur van de lamp; color is een kleur uit COLORS (wit blijft uit)
export function setColor(color) {
  const { r, g, b } = convertColorToRgb(color);
  setChannel(START_ADDRESS, CHANNELS.red, r);
  setChannel(START_ADDRESS, CHANNELS.green, g);
  setChannel(START_ADDRESS, CHANNELS.blue, b);
  setChannel(START_ADDRESS, CHANNELS.white, 0);
}

// Zet de dimmer; value is 0 (uit) t/m 255 (vol)
export function setDimmer(value) {
  setChannel(START_ADDRESS, CHANNELS.dimmer, value);
}
