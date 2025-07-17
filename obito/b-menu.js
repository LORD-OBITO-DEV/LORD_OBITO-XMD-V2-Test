import config from '../config.js';
import process from 'process';

export default {
  name: 'bug-menu',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const caption = `
╔═════════════════════════════
║—͟͟͞͞➸⃝𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2 𝐁𝐔𝐆-𝐌𝐄𝐍𝐔⍣⃝💀
╠═════════════════════════════
║ 👑 OWNER: ${config.OWNER_NAME}
║ 🙋 USER: ${sender}
║ ⚙️ MODE: ${config.MODE.toUpperCase()}
║ ⏱️ UPTIME: ${uptimeStr}
║ 📦 VERSION: 2.0.0
╚════════════════════════════

╔═ —͟͟͞͞➸⃝💀𝐎𝐁𝐈𝐓𝐎-𝐁𝐔𝐆⍣⃝💀
║ ☠︎︎ 𝐤𝐚𝐦𝐮𝐢
║ ☠︎︎︎𝐬𝐡𝐚𝐫𝐢𝐧𝐠𝐚𝐧
║ ☠︎︎︎𝐫𝐢𝐧𝐧𝐞𝐠𝐚𝐧
╚════════════════════════════

> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
`;

    // Envoie de l'image avec le menu
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: 'https://files.catbox.moe/2x874o.jpg' },
      caption
    });

    // Envoie de l'audio (PTT = true => audio type "voice note")
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: 'https://files.catbox.moe/njgypz.mp3' },
      mimetype: 'audio/mpeg',
      ptt: true
    });
  }
};