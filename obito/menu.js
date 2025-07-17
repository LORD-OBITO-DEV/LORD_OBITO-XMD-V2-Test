import config from '../config.js';
import process from 'process';

export default {
  name: 'menu',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0];
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const caption = `
╔══════════════
║ 𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2︎ 𝐌𝐄𝐍𝐔
╠══════════════
║ 👑 OWNER: ${config.OWNER_NAME}
║ 🙋 USER: ${sender}
║ ⚙️ MODE: ${config.MODE.toUpperCase()}
║ ⏱️ UPTIME: ${uptimeStr}
║ 📦 VERSION: 2.0.0
╚══════════════

╔═ 📃 𝐆𝐄𝐍𝐄𝐑𝐀𝐋
║ ✞︎  𝐦𝐞𝐧𝐮
║ ✞︎  𝐩𝐢𝐧𝐠
║ ✞︎  𝐛𝐨𝐭𝐢𝐧𝐟𝐨
║ ✞︎  𝐦𝐨𝐝𝐞
║ ✞︎  𝐛𝐮𝐠-𝐦𝐞𝐧𝐮
╚════════════

╔═ 👥 𝐆𝐑𝐎𝐔𝐏
║ ✞︎  𝐤𝐢𝐜𝐤
║ ✞︎  𝐤𝐢𝐜𝐤𝐚𝐥𝐥
║ ✞︎  𝐭𝐚𝐠𝐚𝐥𝐥
║ ✞︎  𝐭𝐚𝐠
║ ✞︎  𝐰𝐞𝐥𝐜𝐨𝐦𝐞 𝐨𝐧/𝐨𝐟𝐟
║ ✞︎  𝐠𝐨𝐨𝐝𝐛𝐲𝐞 𝐨𝐧/𝐨𝐟𝐟
╚════════════

╔═ 👑 𝐎𝐖𝐍𝐄𝐑
║ ✞︎  𝐨𝐰𝐧𝐞𝐫
║ ✞︎  𝐬𝐮𝐝𝐨
║ ✞︎  𝐝𝐞𝐥𝐬𝐮𝐝𝐨
║ ✞︎  𝐬𝐮𝐝𝐨𝐥𝐢𝐬𝐭
╚════════════

╔═ ✨ 𝐅𝐔𝐍
║ ✞︎  𝐚𝐮𝐭𝐨𝐫𝐞𝐚𝐜𝐭
╚════════════

> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
`;

    // Envoie de l'image avec le menu
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: 'https://files.catbox.moe/iu4d62.jpg' },
      caption
    });

    // Envoie de l'audio (PTT = true => audio type "voice note")
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: 'https://files.catbox.moe/uqt3bj.mp3' },
      mimetype: 'audio/mpeg',
      ptt: true
    });
  }
};