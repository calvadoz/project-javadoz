require("dotenv").config();
const javbus = require("node-javbus")();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const addNewCode = require("./outputCode");
const axios = require("axios");
const { scrapeJavHD, scrapeR18 } = require("./scraper");
const totalPages = 150;
const talkedRecently = new Set();
const initDiscordBot = () => {
  //   const { Client, Intents } = require("discord.js");
  //   const bot = new Client({
  //     intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  //   });
  const Discord = require("discord.js");
  const bot = new Discord.Client();

  const TOKEN = process.env.TOKEN;

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
      // spam prevention
      talkedRecently.add("false");
      if (talkedRecently.has("true")) {
        msg.channel.send("Calm down, please wait 5 seconds before next request !");
      } else {
        talkedRecently.add("true");
        setTimeout(() => {
          msg.channel.send(
            "Movie is published successfully, please continue to !cotd"
          );
          talkedRecently.delete("true");
        }, 5000);
      }
      // if (talkedRecently.has(msg.author.id)) {
      // msg.channel.send(
      //   "Calm down " +
      //     msg.author.username +
      //     ", please wait 15 seconds before your next !cotd"
      // );
      //   return;
      // } else {
      //   talkedRecently.add(msg.author.id);
      // setTimeout(() => {
      //   msg.channel.send(
      //     "OK, <@" + msg.author.id + "> you may now request again..."
      //   );
      //   // Removes the user from the set after a minute
      //   talkedRecently.delete(msg.author.id);
      // }, 15000);
      // }

      try {
        const pageResults = await fetchFromJavBus();
        const randomCodeFromPage = randomizeAndFetch(pageResults);
        if (randomCodeFromPage) {
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
            try {
              const r18movieReq = await scrapeR18(randomCodeFromPage.id);
              console.log("Pushing movies..." + randomCodeFromPage.id);
              await axios.post(
                process.env.FIREBASE_URL + "jav-movies-db.json",
                {
                  guid: uuidv4(),
                  movieId: randomCodeFromPage.id,
                  requester:
                    msg.author.username + "#" + msg.author.discriminator,
                  timestamp: new Date(),
                  trailer:
                    r18movieReq.trailer !== null ? r18movieReq.trailer : null,
                  thumbnail:
                    r18movieReq.poster !== null ? r18movieReq.poster : null,
                  watchCount: 0,
                }
              );
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            msg.channel.send(
              "Something went wrong, please DM Calvadoz",
              e.message
            );
          }
        }
      } catch (e) {
        msg.channel.send("Something went wrong, please DM Calvadoz", e.message);
      }
    }
  });
};

function fetchFromJavBus() {
  let randomPage = randomizeAndFetchRandomPage();
  randomPage = randomPage === 0 ? 1 : randomPage;
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
