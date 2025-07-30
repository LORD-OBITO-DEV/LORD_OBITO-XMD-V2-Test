import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';
import db, { initDB } from './db.js'; // Import base SQLite et init

// Initialisation de la base de données SQLite
await initDB();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });
const app = express();
app.use(express.json());

// === Utils ===
function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function isAdmin(userId) {
  return String(userId) === String(config.ADMIN_ID);
}

// === /start avec système de parrainage ===
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || `ID:${userId}`;
  const refCode = match ? match[1] : null;

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);

  if (!user) {
    const code = generateReferralCode();
    db.prepare(`INSERT INTO users (id, username, code, filleuls, premium_until) VALUES (?, ?, ?, ?, ?)`)
      .run(userId, username, code, JSON.stringify([]), null);
  }

  if (refCode) {
    const parrain = db.prepare(`SELECT * FROM users WHERE code = ?`).get(refCode);
    if (parrain && parrain.id !== userId) {
      const filleuls = JSON.parse(parrain.filleuls || '[]');

      if (!filleuls.includes(userId)) {
        filleuls.push(userId);

        db.prepare(`UPDATE users SET filleuls = ? WHERE id = ?`)
          .run(JSON.stringify(filleuls), parrain.id);

        if (filleuls.length === 3) {
          let now = new Date();
          const parrainData = db.prepare(`SELECT premium_until FROM users WHERE id = ?`).get(parrain.id);
          let expires = parrainData?.premium_until ? new Date(parrainData.premium_until) : now;
          if (expires < now) expires = now;

          expires.setDate(expires.getDate() + 30);
          db.prepare(`UPDATE users SET premium_until = ? WHERE id = ?`)
            .run(expires.toISOString(), parrain.id);

          bot.sendMessage(parrain.id, `🔥 Bravo ! Tu as 3 filleuls. Ton abonnement premium est prolongé de 1 mois automatiquement !`);
        }
      }
    }
  }

  const image = 'https://files.catbox.moe/dsmhrq.jpg';
  const menu = `
╔════════════════════
║—͟͟͞͞➸⃝LORD_OBITO_TECH_PREM_BOT⍣⃝💀
╠════════════════════
║ ✞︎ /abonnement — Voir les moyens de paiement
║ ✞︎ /status — Vérifier ton abonnement
║ ✞︎ /promo — Gagne 1 mois gratuit
║ ✞︎ /codepromo — Ton code personnel
║ ✞︎ /mesfilleuls — Voir tes filleuls
║ ✞︎ /help — Liste des commandes
╚════════════════════════
© BY ✞︎ 𝙇𝙊𝙍𝘿 𝙊𝘽𝙄𝙏𝙊 𝘿𝙀𝙑 ✞
`;

  bot.sendPhoto(chatId, image, { caption: menu, parse_mode: "Markdown" });
});

// === Commandes Utilisateurs ===
bot.onText(/\/help/, (msg) => {
  const text = `
📌 *Commandes disponibles* :

/start — Démarrer le bot
/abonnement — Voir les moyens de paiement
/status — Vérifier ton abonnement
/codepromo — Voir ton code promo
/mesfilleuls — Liste de tes filleuls
/promo — Ton lien de parrainage
/preuve <texte ou images> — Envoyer une preuve de paiement

👑 *Commandes administrateur* :
/valider <id> — Valider un paiement
/rejeter <id> <raison> — Rejeter une demande
/prem <id> — Donner un abonnement premium
/unprem <id> — Révoquer un abonnement
/abonnes — Liste des abonnés actifs
`;
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

bot.onText(/\/codepromo/, (msg) => {
  const userId = msg.from.id;
  const username = msg.from.username || `ID:${userId}`;
  let row = db.prepare('SELECT code FROM users WHERE id = ?').get(userId);

  let code = row?.code || generateReferralCode();
  db.prepare(`
    INSERT INTO users (id, username, code)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET username = excluded.username, code = excluded.code;
  `).run(userId, username, code);

  bot.sendMessage(msg.chat.id, `🎫 Ton code promo : *${code}*\nPartage-le avec /start ${code}`, { parse_mode: "Markdown" });
});

bot.onText(/\/promo/, (msg) => {
  const userId = msg.from.id;
  const username = msg.from.username || `ID:${userId}`;
  let row = db.prepare('SELECT code FROM users WHERE id = ?').get(userId);
  let code = row?.code || generateReferralCode();

  db.prepare(`
    INSERT INTO users (id, username, code)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET username = excluded.username, code = excluded.code;
  `).run(userId, username, code);

  const link = `https://t.me/${config.BOT_USERNAME}?start=${code}`;
  bot.sendMessage(msg.chat.id, `🎁 Invite tes amis avec ce lien :\n${link}\n\n3 filleuls = 1 mois gratuit ! 🔥`);
});

bot.onText(/\/mesfilleuls/, (msg) => {
  const userId = msg.from.id;
  const filleuls = db.prepare(`SELECT id, username FROM users WHERE json_extract(filleuls, '$') LIKE ?`).all(`%${userId}%`);

  if (!filleuls.length) return bot.sendMessage(msg.chat.id, `😔 Tu n'as pas encore de filleuls.`);
  const list = filleuls.map(f => `- ${f.username || `ID:${f.id}`}`).join('\n');
  bot.sendMessage(msg.chat.id, `👥 Tu as ${filleuls.length} filleuls :\n${list}`);
});

bot.onText(/\/abonnement/, (msg) => {
  if (isAdmin(msg.from.id)) return bot.sendMessage(msg.chat.id, '👑 Accès illimité administrateur.');
  const imageURL = 'https://files.catbox.moe/4m5nb4.jpg';
  const message = `
💳 *Abonnement Premium* — 1000 FCFA

📎 Moyens :
• PayPal : /paypal
• Wave : /wave
• Orange : /om
• MTN : /mtn

✅ Après paiement, clique /acces puis envoie /preuve`;
  bot.sendPhoto(msg.chat.id, imageURL, { caption: message, parse_mode: "Markdown" });
});

// Moyens de paiement
bot.onText(/\/paypal/, (msg) => {
  if (isAdmin(msg.from.id)) return;
  bot.sendMessage(msg.chat.id, `🔵 *PayPal* : ${config.PAYPAL_LINK}`, { parse_mode: 'Markdown' });
});
bot.onText(/\/wave/, (msg) => {
  if (isAdmin(msg.from.id)) return;
  bot.sendMessage(msg.chat.id, `🌊 *Wave* : ${config.WAVE_NUMBER}`, { parse_mode: 'Markdown' });
});
bot.onText(/\/om/, (msg) => {
  if (isAdmin(msg.from.id)) return;
  bot.sendMessage(msg.chat.id, `🟠 *Orange Money* : ${config.OM_NUMBER}`, { parse_mode: 'Markdown' });
});
bot.onText(/\/mtn/, (msg) => {
  if (isAdmin(msg.from.id)) return;
  bot.sendMessage(msg.chat.id, `💛 *MTN Money* : ${config.MTN_NUMBER}`, { parse_mode: 'Markdown' });
});

// === /preuve ===
bot.onText(/\/preuve$/, (msg) => {
  bot.sendMessage(msg.chat.id, '❌ Merci d’ajouter un message après `/preuve` (ex: capture, texte...)');
});

bot.onText(/\/preuve (.+)/, (msg, match) => {
  const userId = msg.from.id;
  const username = msg.from.username || `ID:${userId}`;
  const proofText = match[1];

  db.prepare(`
    INSERT INTO pending (user_id, username, proof, requested_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET proof = excluded.proof, requested_at = excluded.requested_at
  `).run(userId, username, proofText, new Date().toISOString());

  bot.sendMessage(msg.chat.id, `📬 Preuve reçue, en attente de validation.`);

  if (config.ADMIN_ID) {
    bot.sendMessage(config.ADMIN_ID, `🔔 Nouvelle preuve de @${username} (${userId}) :\n${proofText}\n/valider ${userId}`);
  }
});

// === /acces ===
bot.onText(/\/acces/, (msg) => {
  const userId = msg.from.id;
  if (isAdmin(userId)) return bot.sendMessage(msg.chat.id, `✅ Accès admin :\n${config.CHANNEL_LINK}`);

  const row = db.prepare(`SELECT premium_until FROM users WHERE id = ?`).get(userId);
  if (row?.premium_until && new Date(row.premium_until) > new Date()) {
    return bot.sendMessage(msg.chat.id, `✅ Accès Premium :\n${config.CHANNEL_LINK}`);
  }
  bot.sendMessage(msg.chat.id, `❌ Abonnement expiré ou non activé. Envoie une preuve avec /preuve après /abonnement`);
});

// === /status ===
bot.onText(/\/status/, (msg) => {
  const userId = msg.from.id;
  if (isAdmin(userId)) return bot.sendMessage(msg.chat.id, '👑 Statut : *ADMIN - illimité*', { parse_mode: 'Markdown' });

  const row = db.prepare(`SELECT premium_until FROM users WHERE id = ?`).get(userId);
  if (row?.premium_until && new Date(row.premium_until) > new Date()) {
    return bot.sendMessage(msg.chat.id, `✅ Abonnement actif jusqu’au : *${new Date(row.premium_until).toLocaleString()}*`, { parse_mode: 'Markdown' });
  }
  bot.sendMessage(msg.chat.id, `❌ Ton abonnement est expiré ou inactif.`);
});

// === Admin commands ===

// === /whitelist <id> ===
bot.onText(/\/whitelist (\d+)/, (msg, match) => {
  if (!isAdmin(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, '⛔ Commande réservée à l’admin.');
  }

  const userId = parseInt(match[1]);
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
  if (!row) {
    return bot.sendMessage(msg.chat.id, `❌ Utilisateur introuvable dans la base.`);
  }

  db.prepare(`UPDATE users SET is_whitelisted = 1 WHERE id = ?`).run(userId);

  bot.sendMessage(userId, `✅ Tu as été ajouté à la whitelist : ton abonnement ne sera jamais expiré automatiquement.`);
  bot.sendMessage(msg.chat.id, `🔒 L'utilisateur ${userId} a été whitelister avec succès.`);
});

// === /valider <id> ===

bot.onText(/\/valider (\d+)/, async (msg, match) => {
  if (!isAdmin(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, '⛔ Commande réservée à l’admin');
  }

  const userId = parseInt(match[1]);

  // Lire la preuve en attente dans la table pending
  const request = db.prepare(`SELECT * FROM pending WHERE user_id = ?`).get(userId);
  if (!request) {
    return bot.sendMessage(msg.chat.id, `❌ Aucune demande pour cet ID.`);
  }

  // Vérifie s’il a ≥ 3 filleuls
  const user = db.prepare(`SELECT filleuls FROM users WHERE id = ?`).get(userId);
  const filleuls = user?.filleuls ? JSON.parse(user.filleuls) : [];
  const bonus = (filleuls.length >= 3) ? 30 : 0;

  // Vérifie si un abonnement existant est actif
  const sub = db.prepare(`SELECT * FROM subscribers WHERE user_id = ?`).get(userId);
  const now = new Date();
  let expireDate = now;

  if (sub && new Date(sub.expires) > now) {
    expireDate = new Date(sub.expires);
  }

  expireDate.setDate(expireDate.getDate() + 30 + bonus);

  // Enregistre ou met à jour l'abonnement
  db.prepare(`
    INSERT INTO subscribers (user_id, username, expires)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET expires = ?;
  `).run(userId, request.username, expireDate.toISOString(), expireDate.toISOString());

  // Supprime la demande validée
  db.prepare(`DELETE FROM pending WHERE user_id = ?`).run(userId);

  // Envoie les messages
  bot.sendMessage(request.user_id, `✅ Paiement confirmé ! Voici ton lien d'accès premium :\n${config.CHANNEL_LINK}`);
  bot.sendMessage(msg.chat.id, `✅ Validé pour @${request.username}`);

  if (bonus > 0) {
    bot.sendMessage(request.user_id, `🎉 Ton abonnement est prolongé de 1 mois grâce à tes 3 filleuls !`);
  }
});

// === /rejeter <id> ===

bot.onText(/\/rejeter (\d+) (.+)/, async (msg, match) => {
  if (!isAdmin(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, '⛔ Commande réservée à l’admin');
  }

  const userId = parseInt(match[1]);
  const reason = match[2];

  const request = db.prepare(`SELECT * FROM pending WHERE user_id = ?`).get(userId);
  if (!request) {
    return bot.sendMessage(msg.chat.id, `❌ Aucune demande en attente pour cet ID.`);
  }

  // Supprime la demande
  db.prepare(`DELETE FROM pending WHERE user_id = ?`).run(userId);

  // Notifie l'utilisateur
  bot.sendMessage(request.user_id, `❌ Ta demande d'accès a été rejetée.\nRaison : ${reason}`);

  // Confirmation pour l'admin
  bot.sendMessage(msg.chat.id, `✅ Demande de @${request.username} (ID: ${userId}) rejetée.\nRaison : ${reason}`);
});

// === /prem <id> ===

bot.onText(/\/prem (\d+)/, (msg, match) => {
  if (!isAdmin(msg.from.id)) return;
  const userId = parseInt(match[1]);
  const username = msg.from.username || `ID:${userId}`;
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 30);
  db.prepare(`
    INSERT INTO users (id, username, premium_until)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET premium_until = ?;
  `).run(userId, username, expireDate, expireDate);
  bot.sendMessage(userId, `🎉 Abonnement premium activé manuellement.`);
  bot.sendMessage(msg.chat.id, `✅ Premium accordé à ${username}`);
});

bot.onText(/\/unprem (\d+)/, (msg, match) => {
  if (!isAdmin(msg.from.id)) return;
  const userId = parseInt(match[1]);
  db.prepare(`UPDATE users SET premium_until = NULL WHERE id = ?`).run(userId);
  bot.sendMessage(userId, `⚠️ Ton abonnement a été révoqué par l'admin.`);
  bot.sendMessage(msg.chat.id, `✅ Révocation effectuée.`);
});

bot.onText(/\/abonnes/, (msg) => {
  if (!isAdmin(msg.from.id)) return;
  const now = new Date().toISOString();
  const abonnés = db.prepare(`SELECT id, username, premium_until FROM users WHERE premium_until > ?`).all(now);

  if (!abonnés.length) return bot.sendMessage(msg.chat.id, '📭 Aucun abonné actif.');
  const liste = abonnés.map(u => `• ${u.username} (ID: ${u.id})\n  Expire le: ${new Date(u.premium_until).toLocaleDateString()}`).join('\n\n');
  bot.sendMessage(msg.chat.id, `📋 *Liste des abonnés actifs* (${abonnés.length}) :\n\n${liste}`, { parse_mode: 'Markdown' });
});

// Nettoyage auto chaque heure (avec gestion des whitelistés)
setInterval(() => {
  const now = new Date().toISOString();

  // Supprime l'abonnement uniquement pour ceux qui NE sont PAS whitelistés
  db.prepare(`
    UPDATE users
    SET premium_until = NULL
    WHERE premium_until IS NOT NULL
      AND premium_until < ?
      AND whitelisted = 0
  `).run(now);

  // Optionnel : notifier les utilisateurs expirés (non whitelistés)
  const expiredUsers = db.prepare(`
    SELECT id FROM users
    WHERE premium_until IS NULL AND whitelisted = 0
  `).all();

  expiredUsers.forEach(u => {
    bot.sendMessage(u.id, "⏰ Ton abonnement premium a expiré. Merci de renouveler avec /abonnement.");
  });

  console.log("🧹 Nettoyage des abonnements expirés (hors whitelist)");
}, 3600000);



// Webhook Express
const PORT = process.env.PORT || 3000;
const HOST = process.env.RENDER_EXTERNAL_URL || `https://lord-obito-xmd-v2-test.onrender.com`; // Remplace si besoin

bot.setWebHook(`HOST/bot{config.BOT_TOKEN}`);

app.post(`/botconfig.BOT_TOKEN`, (req, res) => 
  bot.processUpdate(req.body);
  res.sendStatus(200);
);

app.get('/', (_, res) => res.send("✅ Bot actif."));

app.listen(PORT, () => 
  console.log(`🚀 Bot webhook lancé sur port{PORT}`);
});
