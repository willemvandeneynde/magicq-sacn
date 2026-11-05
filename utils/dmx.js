// Volledige DMX-universe; index 0 = DMX-adres 1
export const dmx = new Uint8Array(512);

// Zet een kanaal van een fixture; offset is t.o.v. het startadres (offset 0 = startadres zelf)
export function setChannel(startAddress, offset, value) {
  dmx[startAddress - 1 + offset] = value;
}
