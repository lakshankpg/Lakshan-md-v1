const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const { upload } = require("./mega");

const router = express.Router();

// 🔧 Helper function to remove a directory or file
function removeFile(FilePath) {
  if (fs.existsSync(FilePath)) {
    fs.rmSync(FilePath, { recursive: true, force: true });
  }
}

router.get("/", async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).json({ error: "Missing phone number" });

  async function ලක්ශාන්Pair() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    try {
      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
      });

      // 📲 Request pairing code if not registered
      if (!sock.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, "");
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) return res.send({ code });
      }

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
          try {
            await delay(10000);
            const authPath = path.join(__dirname, "../session/creds.json");

            const userJid = jidNormalizedUser(sock.user.id);
            const mega_url = await upload(fs.createReadStream(authPath), `${generateID()}.json`);

            const stringSession = mega_url.replace("https://mega.nz/file/", "");
            const sessionMessage = `*lakshan [The powerful WA BOT]*\n\n👉 ${stringSession} 👈\n\n*This is your Session ID. Copy and paste it into config.js*\n\n*owner number: 0763441376*\n\nWhatsApp Channel: https://whatsapp.com/channel/0029VbATiG42kNFiNJegHd2B`;
            const warning = `🛑 *මෙම කොඩ් එක කාටවත් ශෙයා නොකරන්න උබට ඔනෙනම් ශෙයා කරපන් ශෙයා කරලා whatsapp එක නැති වුනා කියලා කියන්න එපා.* 🛑`;

            await sock.sendMessage(userJid, {
              image: { url: "https://files.catbox.moe/s56rr7.jpg" },
              caption: sessionMessage,
            });
            await sock.sendMessage(userJid, { text: stringSession });
            await sock.sendMessage(userJid, { text: warning });

            await delay(500);
            removeFile("./session");
            process.exit(0);

          } catch (err) {
            console.error("⚠️ Error sending session:", err);
            exec("pm2 restart prabath");
          }
        } else if (
          connection === "close" &&
          lastDisconnect?.error?.output?.statusCode !== 401
        ) {
          await delay(10000);
          RobinPair(); // Reconnect
        }
      });

    } catch (err) {
      console.error("🔥 RobinPair error:", err);
      exec("pm2 restart Robin-md");
      removeFile("./session");
      if (!res.headersSent) {
        res.status(503).json({ code: "Service Unavailable" });
      }
    }
  }

  await RobinPair();
});

// 🧠 Safe random ID generator
function generateID(length = 6, digits = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const number = Math.floor(Math.random() * Math.pow(10, digits));
  return `${result}${number}`;
}

// 🔐 Catch all uncaught errors and restart
process.on("uncaughtException", (err) => {
  console.error("Caught uncaughtException:", err);
  exec("pm2 restart Robin");
});

module.exports = router;
