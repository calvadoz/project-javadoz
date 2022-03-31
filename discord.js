require("dotenv").config();
const javbus = require("node-javbus")();
const fs = require("fs");
const addNewCode = require("./outputCode");
const axios = require("axios");
const totalPages = 150;

const initDiscordBot = () => {
  //   const { Client, Intents } = require("discord.js");
  //   const bot = new Client({
  //     intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  //   });
  const Discord = require("discord.js");
  const bot = new Discord.Client();

  const TOKEN = process.env.TOKEN;
  const javbusWeb = "https://javbus.com/en/";
  const javbusWebRoot = "https://javbus.com";

  bot.login(TOKEN);

  bot.on("ready", () => {
    console.log(`${bot.user.tag} ! is summoned and reporting for duty..... o7`);
  });

  bot.on("message", async (msg) => {
    if (msg.content.toLowerCase() === "hello") {
      msg.channel.send("Trying to wake the bot up...");
      try {
        await axios.get(
          "https://project-javadoz.herokuapp.com/api/healthcheck"
        );
      } catch (e) {
        msg.channel.send("Bot is deadge, please DM Calvadoz...");
      }
    }
    if (msg.content.toLowerCase() === "!cotd") {
      try {
        const pageResults = await fetchFromJavBus();
        const randomCodeFromPage = randomizeAndFetch(pageResults);
        if (randomCodeFromPage) {
          addNewCode(randomCodeFromPage.id);
          try {
            const movieDetails = await queryJAVBus(randomCodeFromPage.id);
            const cover = movieDetails.cover;
            msg.channel.send(movieDetails.title);
            msg.channel.send(
              "***Model: ***" +
                movieDetails.stars.map((star) => star.name).join(", ")
            );
            msg.channel.send("***Release Date: *** " + randomCodeFromPage.date);
            msg.channel.send(cover);
            // send to firebase
            axios.post(process.env.FIREBASE_URL, {
              movieId: randomCodeFromPage.id,
              requester: msg.author.username + "#" + msg.author.discriminator,
              timestamp: new Date()
            });
            return;
          } catch (e) {
            msg.channel.send("Something went wrong, please DM Calvadoz");
          }
        }
      } catch (e) {
        msg.channel.send("Something went wrong, please DM Calvadoz");
      }
    }
  });
};

function fetchFromJavBus() {
  let randomPage = randomizeAndFetchRandomPage();
  console.log("Page no: ", randomPage);
  try {
    return javbus.page(randomPage);
  } catch (e) {
    throw new error("Got error la", e);
  }
}

function queryJAVBus(code) {
  try {
    return javbus.show(code).catch((e) => console.log(e));
  } catch (e) {
    throw new error("Got error la", e);
  }
}

function randomizeAndFetch(codes) {
  if (codes) {
    const randomLine = Math.floor(Math.random() * codes.length); // Math.floor(0 - 1 * 2000xx)
    return codes[randomLine];
  }
  return "Bo code liao...";
}

function randomizeAndFetchRandomPage() {
  return Math.floor(Math.random() * totalPages);
}

module.exports = initDiscordBot;
