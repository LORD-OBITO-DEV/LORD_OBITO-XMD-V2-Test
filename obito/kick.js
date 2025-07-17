export default {
  name: 'kick',
  category: 'Group',
  execute: async (sock, msg, args) => {
    if (args.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* .kick 123456789' });
    const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await sock.groupParticipantsUpdate(msg.key.remoteJid, [number], 'remove');
    await sock.sendMessage(msg.key.remoteJid, { text: `🚫 *${args[0]} has been removed.*` });
  }
};
