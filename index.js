import dgram from 'node:dgram';
import { UNIVERSE, LOCAL_IP, SACN_PORT } from './config.js';
import { COLORS } from './constants.js';
import * as scx500 from './fixtures/scx500.js';
import * as vision105PixZ from './fixtures/vision105PixZ.js';
import { sacnPacket } from './utils/sacn.js';
import { dmx } from './utils/dmx.js';

// Multicast-adres voor dit universe (239.255.<hi>.<lo>)
const TARGET = `239.255.${(UNIVERSE >> 8) & 0xff}.${UNIVERSE & 0xff}`;

scx500.locate();
scx500.setColor(COLORS.RED);
vision105PixZ.locate();
vision105PixZ.setColor(COLORS.BLUE);

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
socket.on('error', (err) => console.error('❌ Socket fout:', err));

let count = 0;
function send(done) {
  socket.send(sacnPacket(UNIVERSE, dmx), SACN_PORT, TARGET, (err) => {
    if (err) console.error('❌ Verzendfout:', err.message);
    else {
      count++;
      process.stdout.write(`\r📤 ${count} sACN pakketten verstuurd naar ${TARGET} universe ${UNIVERSE} (DMX ${dmx})   `);
    }
    done?.();
  });
}

socket.bind({ address: LOCAL_IP, port: 0 }, () => {
  socket.setMulticastInterface(LOCAL_IP);
  socket.setMulticastLoopback(true); // Zodat MagicQ op dezelfde PC het multicastverkeer ook ontvangt
  socket.setMulticastTTL(1);
  console.log(`📡 sACN verzenden vanaf ${LOCAL_IP}. Ctrl+C om te stoppen.`);
  send();
  setInterval(send, 1000); // Elke seconde herhalen, anders laat MagicQ de input los
});

// Bij Ctrl+C eerst alle fixtures dimmen en dat versturen, pas daarna stoppen
process.on('SIGINT', () => {
  scx500.setDimmer(0);
  vision105PixZ.setDimmer(0);
  send(() => {
    socket.close();
    console.log('\n🔌 Fixtures gedimd, gestopt.');
    process.exit(0);
  });
});
