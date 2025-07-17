import config from '../config.js';

export default {
  name: 'owner',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `👑 *OWNER INFO*\n\n👤 Name: ${config.OWNER_NAME}\n📞 Number: ${config.OWNER_NUMBER}\n🔗 Channel: ${config.CHANNEL_URL}`
    });
  }
};
