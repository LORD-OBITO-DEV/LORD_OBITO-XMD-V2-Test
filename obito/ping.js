export default {
  name: 'ping',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `╔════════════════════════════
║ 🏓 *PONG!*
╠═════════════════════════════════
║ ✅ 𝐋𝐎𝐑𝐃_𝐎𝐁𝐈𝐓𝐎-𝐗𝐌𝐃-𝐕2
║ ✅ is online and responding!
║ 🚀 Fast and reliable as the North Wind ㋛︎
╚═════════════════════════════════`
    });
  }
};
