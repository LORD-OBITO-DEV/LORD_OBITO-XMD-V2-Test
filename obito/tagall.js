export default {
  name: 'tagall',
  category: 'Group',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, {
        text: '🚫 *Cette commande ne peut être utilisée que dans les groupes.*'
      });
    }

    const metadata = await sock.groupMetadata(jid);
    const groupName = metadata.subject;
    const groupMembers = metadata.participants;
    const memberCount = groupMembers.length;

    const senderJid = msg.key.participant || msg.key.remoteJid;
    const sender = metadata.participants.find(p => p.id === senderJid);
    const adminName = sender?.notify || sender?.id.split('@')[0];

    // Tente de récupérer la photo de profil du lanceur
    let pfp = null;
    try {
      pfp = await sock.profilePictureUrl(senderJid, 'image');
    } catch {
      pfp = 'https://i.ibb.co/F4t9g2v/default-pfp.png'; // Fallback image
    }

    // Préparer les mentions ✞︎
    const mentions = [];
    let textList = `╔═══════ 『✞︎ TAGALL ✞︎』═══════\n`;
    textList += `║ 📛 Groupe: *${groupName}*\n`;
    textList += `║ 🙋 Appelé par: @${adminName}\n`;
    textList += `║ 👥 Membres: *${memberCount}*\n`;
    textList += `╠══════════════════════════\n`;

    groupMembers.forEach((member, index) => {
      const userTag = `@${member.id.split('@')[0]}`;
      textList += `║ ${index + 1}. ✞︎ ${userTag}\n`;
      mentions.push(member.id);
    });

    textList += `╚══════════════════════════\n> ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞︎`;

    // Envoie du tag avec la photo de profil de l'utilisateur
    await sock.sendMessage(jid, {
      image: { url: pfp },
      caption: textList,
      mentions
    });
  }
};