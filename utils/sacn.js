import { randomBytes } from 'node:crypto';

const CID = randomBytes(16); // Unieke afzender-ID; hiermee onderscheidt de ontvanger bronnen
let sequence = 0;

// E1.31 (sACN) datapakket: root layer + framing layer + DMP layer + 512 kanalen = 638 bytes
export function sacnPacket(universe, data) {
  const p = Buffer.alloc(638);
  // Root layer
  p.writeUInt16BE(0x0010, 0);
  p.writeUInt16BE(0x0000, 2);
  p.write('ASC-E1.17\0\0\0', 4, 'ascii');
  p.writeUInt16BE(0x7000 | (638 - 16), 16);
  p.writeUInt32BE(0x00000004, 18);
  CID.copy(p, 22);
  // Framing layer
  p.writeUInt16BE(0x7000 | (638 - 38), 38);
  p.writeUInt32BE(0x00000002, 40);
  p.write('Node.js test', 44, 'utf8');      // Bronnaam (64 bytes veld)
  p.writeUInt8(100, 108);                   // Prioriteit
  p.writeUInt16BE(0, 109);                  // Sync address
  p.writeUInt8(sequence, 111);
  p.writeUInt8(0, 112);                     // Options
  p.writeUInt16BE(universe, 113);
  // DMP layer
  p.writeUInt16BE(0x7000 | (638 - 115), 115);
  p.writeUInt8(0x02, 117);
  p.writeUInt8(0xa1, 118);
  p.writeUInt16BE(0x0000, 119);             // First property address
  p.writeUInt16BE(0x0001, 121);             // Address increment
  p.writeUInt16BE(513, 123);                // Startcode + 512 kanalen
  p.writeUInt8(0x00, 125);                  // DMX startcode
  Buffer.from(data).copy(p, 126);
  sequence = (sequence + 1) & 0xff;
  return p;
}
