// ============================================================
//  Telegram Bot Webhook for Dmitry_Lixxx на бездорожье
//  Bot: @Dmitry_Lixxx_offroad_bot
//  Game URL: configured via VERCEL_URL env var or auto-detect
// ============================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8829110329:AAF2Hn9FELZu-n8RpdjAi9E_qCv4mtHRUYw';

// Game URL — Vercel auto-injects VERCEL_URL, fallback to env
function getGameUrl(req) {
  if (process.env.GAME_URL) return process.env.GAME_URL;
  if (process.env.VERCEL_URL) return 'https://' + process.env.VERCEL_URL;
  // Try to derive from request
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return host ? `${proto}://${host}` : 'https://dmitry-lixxx-offroad.vercel.app';
}

async function tgApi(method, body = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await resp.json();
  } catch (e) {
    console.error('TG API error:', method, e.message);
    return { ok: false, error: e.message };
  }
}

async function sendMsg(chatId, text, extra = {}) {
  return tgApi('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra
  });
}

async function setBotCommands() {
  return tgApi('setMyCommands', {
    commands: [
      { command: 'play', description: '🎮 Играть в Dmitry_Lixxx на бездорожье' },
      { command: 'help', description: '📖 Как играть' },
      { command: 'about', description: 'ℹ️ О игре' },
      { command: 'support', description: '💬 Поддержка' }
    ]
  });
}

async function setBotMenuButton() {
  // Sets the web app button in main menu
  return tgApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🎮 Играть',
      web_app: { url: 'https://placeholder.vercel.app' } // will be updated with real URL
    }
  });
}

// ---- Webhook handler ----
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'alive', bot: 'Dmitry_Lixxx_offroad_bot' });
  }

  const update = req.body;
  const gameUrl = getGameUrl(req);

  try {
    // === /start, /play ===
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();
      const cmd = text.split(' ')[0].toLowerCase().split('@')[0];

      if (cmd === '/start' || cmd === '/play') {
        await sendMsg(chatId,
          `🎮 <b>Dmitry_Lixxx на бездорожье</b>\n\n` +
          `Готов гонять по бездорожью на Ниве? 🚙💨\n\n` +
          `• Реалистичная физика (Phaser 3 + Planck.js)\n` +
          `• Бесконечный процедурный рельеф\n` +
          `• Топливо, монеты, рекорды\n\n` +
          `<b>Жми кнопку ниже, чтобы начать!</b>`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🚗 ГОНЯТЬ!', web_app: { url: gameUrl } }
              ]]
            }
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/help') {
        await sendMsg(chatId,
          `📖 <b>Как играть</b>\n\n` +
          `📱 <b>Тач:</b> правая кнопка — газ, левая — тормоз/назад\n` +
          `⌨️ <b>Клава:</b> → газ, ← тормоз/назад (или D/A, W/S, Space)\n\n` +
          `🎯 <b>Цель:</b> проехать как можно дальше, собирая монеты и канистры.\n\n` +
          `⚠️ <b>Game over:</b>\n` +
          `• Топливо кончилось\n` +
          `• Нива перевернулась\n` +
          `• Дмитрий ударился головой\n\n` +
          `🏆 Рекорд сохраняется автоматически!`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🚗 Играть', web_app: { url: gameUrl } }
              ]]
            }
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/about') {
        await sendMsg(chatId,
          `ℹ️ <b>О игре</b>\n\n` +
          `<b>Dmitry_Lixxx на бездорожье</b> — аркада с физикой автомобиля в стиле Hill Climb Racing.\n\n` +
          `🛠 <b>Стек:</b>\n` +
          `• Phaser 3.80.1 — игровой движок\n` +
          `• Planck.js 1.0 — физика (Box2D port)\n` +
          `• Web Audio API — звук\n` +
          `• Vanilla JS, без сборщиков\n\n` +
          `🎨 Все ассеты генерируются процедурно\n` +
          `📦 Один HTML файл, ~47 КБ\n\n` +
          `Сделано с ❤️ для стримера Dmitry_Lixxx`
        );
        return res.status(200).json({ ok: true });
      }

      if (cmd === '/support') {
        await sendMsg(chatId,
          `💬 <b>Поддержка</b>\n\n` +
          `Нашёл баг? Есть идея? Хочешь стрим с игрой?\n\n` +
          `Пиши сюда — разберёмся!`
        );
        return res.status(200).json({ ok: true });
      }

      // === Inline query (link preview) ===
      if (msg.text && !text.startsWith('/')) {
        await sendMsg(chatId,
          `Привет! Готов гонять? 🚙\n\nЖми /play чтобы начать!`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🚗 Играть', web_app: { url: gameUrl } }
              ]]
            }
          }
        );
        return res.status(200).json({ ok: true });
      }
    }

    // === Inline query ===
    if (update.inline_query) {
      const iq = update.inline_query;
      await tgApi('answerInlineQuery', {
        inline_query_id: iq.id,
        results: [
          {
            type: 'article',
            id: 'play_game',
            title: '🎮 Dmitry_Lixxx на бездорожье',
            description: 'Нажми, чтобы открыть игру',
            input_message_content: {
              message_text: `🎮 Dmitry_Lixxx на бездорожье — жми играть!`,
              parse_mode: 'HTML'
            },
            reply_markup: {
              inline_keyboard: [[
                { text: '🚗 Играть', web_app: { url: gameUrl } }
              ]]
            }
          }
        ],
        cache_time: 0
      });
      return res.status(200).json({ ok: true });
    }

    // === Callback query (button click) ===
    if (update.callback_query) {
      const cq = update.callback_query;
      await tgApi('answerCallbackQuery', {
        callback_query_id: cq.id,
        text: 'Загружаем игру...'
      });
      return res.status(200).json({ ok: true });
    }

    // === Pre-checkout (payments, not used now) ===
    if (update.pre_checkout_query) {
      await tgApi('answerPreCheckoutQuery', {
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(200).json({ ok: true }); // always return 200 to TG
  }
}
