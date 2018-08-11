const Telegraf = require('telegraf');
const tmi = require('tmi.js');
const axios = require('axios');
const ent = require('ent');

const {
  BOT_TOKEN,
  BOT_ADMIN,
  USERNAME,
  PASSWORD,
} = process.env;

const bot = new Telegraf(BOT_TOKEN);
const client = new tmi.client({
  identity: {
    username: USERNAME,
    password: `oauth:${PASSWORD}`,
  },
});


bot.command('connect', async ({ from, message, reply }) => {
  if (from.id != BOT_ADMIN) return;
  const channel = message.text.slice(9);
  client.opts.channels[0] = channel;

  try {
    await client.connect();
  } catch (err) {
    console.log(err);
    reply('something went wrong')
  }
});

bot.command('disconnect', async ({ from, reply }) => {
  if (from.id != BOT_ADMIN) return;

  try {
    await client.disconnect();
  } catch (err) {
    console.log(err);
    reply('Not connected or sth else');
  }
});

bot.command('chatters', async ({ from, message, reply, replyWithHTML }) => {
  if (from.id != BOT_ADMIN) return;

  let channel = message.text.slice(10);
  if (channel.length === 0)
    channel = client.opts.channels[0];

  try {
    const { data } = await axios.get(`https://tmi.twitch.tv/group/user/${channel}/chatters`);
    chatterCount = data.chatter_count;
    chatters = data.chatters;
    let msgToSend = `<b>Count</b>: ${chatterCount}\n\n`;

    for (chatterGroup in chatters) {
      if (chatters[chatterGroup].length > 0) {
        msgToSend += `<b>${chatterGroup}</b>:\n`;
        chatters[chatterGroup].forEach((chatter) => {
          msgToSend += `${chatter}\n`;
        });
        msgToSend += '\n';
      }
    }
    replyWithHTML(msgToSend);
  } catch (err) {
    console.log(err);
    reply('something went wrong')
  }
});

client.on('connected', (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`)
  bot.telegram.sendMessage(BOT_ADMIN, `* Connected to ${addr}:${port}`);
});

client.on('disconnected', (reason) => {
  console.log(`disconnected: ${reason}`);
  bot.telegram.sendMessage(BOT_ADMIN, `disconnected: ${reason}`)
});

client.on('message', async (target, ctx, msg, self) => {
  try {
    await bot.telegram.sendMessage(BOT_ADMIN, `<a href="http://thisisonlyfor-makingthetextbluehaha.com">${ctx.username}</a>:\n${ent.encode(msg)}`, { parse_mode: 'HTML' });
  } catch (err) {
    console.log(err);
  }
});

bot.startPolling();
