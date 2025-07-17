import config from '../config.js';

export default {
  name: 'goodbye',
  description: 'Message stylé de départ d’un membre du groupe',
  category: 'group',
  async execute(sock, message, args) {
    try {
      const from = message.key.remoteJid;
      const userId = message.key.participant || message.key.remoteJid;
      const username = userId.split('@')[0];

      // Vérifie si GOODBYE est activé
      if (!config.GOODBYE_ENABLED) {
        return; // Ne rien envoyer si désactivé
      }

      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject || 'ce groupe';
      const membersCount = metadata.participants.length;

      let profilePicUrl = null;
      try {
        profilePicUrl = await sock.profilePictureUrl(userId, 'image');
      } catch {
        profilePicUrl = null;
      }

      const dateString = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });

      const text = `
╔═════════════☹︎︎═══════════════
║ 😢 *@${username}* a quitté le groupe.
╠═════════════☹︎═══════════════
║ 👥 *Groupe :* ${groupName}
║ 👤 *Membres restants :* ${membersCount}
║ 🗓️ *Date :* ${dateString}
║ 🤖 *Bot :* ${config.BOT_NAME || 'LORD_OBITO-XMD-V2'}
║
╚═════════════════════════════
> BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
      `.trim();

      await sock.sendMessage(from, {
        image: profilePicUrl ? { url: profilePicUrl } : undefined,
        caption: text,
        mentions: [userId]
      });
    } catch (err) {
      console.error('❌ Erreur dans goodbye.js :', err);
    }
  }
};