import config from '../config.js';
import chalk from 'chalk';
import commands from '../obito/index.js';  // ⬅️ Correction ici

export async function Handler(msg, sock, logger) {
  try {
    const message = msg.messages[0];
    if (!message || !message.message) return;

    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const type = Object.keys(message.message)[0];

    logger.info(`📨 Message received from ${from} | Type: ${type} | Group: ${isGroup}`);

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text;

    if (!text) return;

    const prefix = config.PREFIX || '.';

    if (text.startsWith(prefix)) {
      const [command, ...args] = text.slice(prefix.length).trim().split(/\s+/);
      const cmd = commands[command.toLowerCase()];
      if (cmd && typeof cmd.execute === 'function') {
        await cmd.execute(sock, message, args);
      } else {
        await sock.sendMessage(from, { text: `❓ Commande Unknown: *${command}*` });
      }
    }
  } catch (e) {
    console.error('❌ Erreur Handler:', e);
  }
}
