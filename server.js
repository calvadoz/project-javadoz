require("dotenv").config();
const javbus = require("node-javbus")();
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const { Client, Intents } = require("discord.js");
const bot = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// const Discord = require("discord.js");
// const bot = new Discord.Client();
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

app.get("/api/healthcheck", (req, res) => {
  res.send("Nothing here.. Just to check if the server is healthy");
});

app.listen(3000, () => console.log(""));
