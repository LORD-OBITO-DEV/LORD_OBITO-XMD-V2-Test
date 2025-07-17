import chalk from 'chalk';

export async function Callupdate(call, sock) {
  try {
    for (const update of call) {
      const callerId = update.from;
      console.log(chalk.red(`📞 Call detected from ${callerId}`));

      if (update.status === 'offer') {
        await sock.updateBlockStatus(callerId, 'block');
        await sock.sendMessage(callerId, {
          text: `🚫 Calls are barred. You have been temporarily blocked..`,
        });
      }
    }
  } catch (err) {
    console.error("❌ Erreur Callupdate:", err);
  }
}
