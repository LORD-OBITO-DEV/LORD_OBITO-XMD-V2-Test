import config from '../config.js';
import fs from 'fs-extra';

const autoreactFile = './lib/autoreact.js';

export default {
  name: 'autoreact',
  category: 'General',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Load sudo list
    let sudoList = [];
    if (fs.existsSync('./lib/sudo.json')) {
      sudoList = JSON.parse(await fs.readFile('./lib/sudo.json'));
    }

    // Check OWNER or SUDO permission
    if (sender !== config.OWNER_NUMBER && !sudoList.includes(sender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner or Sudo only.*' });
    }

    // Read current status
    let currentState = false;
    if (fs.existsSync(autoreactFile)) {
      const data = JSON.parse(await fs.readFile(autoreactFile));
      currentState = data.enabled || false;
    }

    // Change state according to argument
    if (args.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `🤖 *Auto React Status:* ${currentState ? 'Enabled ✅' : 'Disabled ❌'}\n\nUsage: !autoreact on/off`
      });
    }

    const action = args[0].toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📝 *Usage:* !autoreact on/off'
      });
    }

    // Update file
    await fs.writeFile(autoreactFile, JSON.stringify({ enabled: action === 'on' }, null, 2));

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ *Auto React has been ${action === 'on' ? 'enabled' : 'disabled'}.*`
    });
  }
};
