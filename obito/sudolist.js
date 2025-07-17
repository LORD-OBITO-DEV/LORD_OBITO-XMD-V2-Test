import fs from 'fs-extra';
import config from '../config.js';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudolist',
  category: 'Sudo',
  execute: async (sock, msg) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Check OWNER or SUDO permission
    if (sender !== config.OWNER_NUMBER) {
      if (!fs.existsSync(sudoFile)) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ *No sudo users found.*' });
      }
      const sudoList = JSON.parse(await fs.readFile(sudoFile));
      if (!sudoList.includes(sender)) {
        return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner or Sudo only.*' });
      }
    }

    if (!fs.existsSync(sudoFile)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *No sudo users found.*' });
    }

    const sudoList = JSON.parse(await fs.readFile(sudoFile));
    if (sudoList.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *Sudo list is empty.*' });
    }

    const list = sudoList.map((num, i) => `  ${i + 1}. 👉 +${num}`).join('\n');

    const text = `
╔══════════════════════╗
║    👑 SUDO USERS LIST      
╠══════════════════════╣
${list}
╚═══════════════════════╝
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, { text });
  }
};
