require("dotenv").config();
const javbus = require("node-javbus")();
const fs = require("fs");
const addNewCode = require("./outputCode");

const initDiscordBot = () => {
  const { Client, Intents } = require("discord.js");
  const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });

  const TOKEN = process.env.TOKEN;
  const javbusWeb = "https://javbus.com/en/";
  const javbusWebRoot = "https://javbus.com";

  bot.login(TOKEN);

  bot.on("ready", () => {
    console.log(`${bot.user.tag} ! is summoned and reporting for duty..... o7`);
  });

  bot.on("messageCreate", (msg) => {
    if (msg.content.toLowerCase() === "!cotd") {
      msg.reply("Disruptive code detected, do NOT try it again");
    }
  });
};

module.exports = initDiscordBot;
