import { COLORS } from '../constants.js';

// RGB-waarden (0 t/m 255) per kleur uit constants.js
const RGB_VALUES = {
  [COLORS.RED]: { r: 255, g: 0, b: 0 },
  [COLORS.GREEN]: { r: 0, g: 255, b: 0 },
  [COLORS.BLUE]: { r: 0, g: 0, b: 255 },
};

// Zet een kleur uit COLORS om naar { r, g, b }
export function convertColorToRgb(color) {
  const rgb = RGB_VALUES[color];
  if (!rgb) throw new Error(`Onbekende kleur: ${color}`);
  return rgb;
}
