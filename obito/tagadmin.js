export default {
  name: 'tag-admin',
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

    const senderId = msg.key.participant || msg.key.remoteJid;
    const sender = metadata.participants.find(p => p.id === senderId);
    const adminName = sender?.notify || sender?.id.split('@')[0];

    // Filtrer les admins
    const admins = groupMembers.filter(member => member.admin !== null);
    const adminCount = admins.length;

    if (adminCount === 0) {
      return sock.sendMessage(jid, {
        text: '❌ Aucun admin trouvé dans ce groupe.'
      });
    }

    const mentions = [];
    let textList = `╔═══════ 『✞︎ TAGADMIN ✞︎』═══════\n`;
    textList += `║ 📛 Groupe: *${groupName}*\n`;
    textList += `║ 🙋 Appelé par: @${adminName}\n`;
    textList += `║ 🛡️ Admins: *${adminCount} / ${memberCount}*\n`;
    textList += `╠══════════════════════════\n`;

    admins.forEach((admin, index) => {
      const userTag = `@${admin.id.split('@')[0]}`;
      textList += `║ ${index + 1}. ✞︎ ${userTag}\n`;
      mentions.push(admin.id);
    });

    textList += `╚══════════════════════════\n> ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞︎`;

    await sock.sendMessage(jid, {
      text: textList,
      mentions
    });
  }
};