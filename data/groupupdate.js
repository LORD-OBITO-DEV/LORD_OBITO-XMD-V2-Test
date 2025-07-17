import chalk from 'chalk';
import config from '../config.js';

export async function GroupUpdate(sock, group) {
  try {
    const { id, participants, action } = group;

    participants.forEach(async participant => {
      const username = participant.split('@')[0];

      if (action === 'add' && config.WELCOME_ENABLED) {
        console.log(chalk.green(`👤 ${participant} a rejoint ${id}`));

        try {
          const welcomeCmd = (await import('../obito/welcome.js')).default;
          const fakeMsg = {
            key: { remoteJid: id, participant },
            message: { conversation: '.welcome' }
          };
          await welcomeCmd.execute(sock, fakeMsg, []);
        } catch (err) {
          console.error("❌ Erreur lors de l'appel automatique de la commande welcome :", err);
        }

      } else if (action === 'remove' && config.GOODBYE_ENABLED) {
        console.log(chalk.yellow(`🚪 ${participant} a quitté ${id}`));

        try {
          const goodbyeCmd = (await import('../obito/goodbye.js')).default;
          const fakeMsg = {
            key: { remoteJid: id, participant },
            message: { conversation: '.goodbye' }
          };
          await goodbyeCmd.execute(sock, fakeMsg, []);
        } catch (err) {
          console.error("❌ Erreur lors de l'appel automatique de la commande goodbye :", err);
        }
      }
    });
  } catch (err) {
    console.error("❌ Erreur générale GroupUpdate:", err);
  }
}