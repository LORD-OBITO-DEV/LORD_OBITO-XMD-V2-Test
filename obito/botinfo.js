import config from '../config.js';

export default {
  name: 'botinfo',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `
╔═════════════❦︎═══════════════
║ 🤖 ༒︎𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2༒︎ 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐒
╠═════════════❦︎═══════════════
║ 👤 Owner: ${config.OWNER_NAME}
║ 📞 Number: ${config.OWNER_NUMBER}
║ 🔗 Channel: ${config.CHANNEL_URL}
╚═════════════════════════════
      `.trim()
    });
  }
};
