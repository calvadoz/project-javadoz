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

            const r18movieReq = await scrapeR18(randomCodeFromPage.id);

            // send to firebase
            try {
              console.log("Pushing movies..." + randomCodeFromPage.id);
              await axios.post(
                process.env.FIREBASE_URL + "jav-movies-r18.json",
                {
                  movieId: randomCodeFromPage.id,
                  requester:
                    msg.author.username + "#" + msg.author.discriminator,
                  timestamp: new Date(),
                  trailer:
                    r18movieReq.trailer !== null ? r18movieReq.trailer : null,
                  thumbnail:
                    r18movieReq.poster !== null ? r18movieReq.poster : null,
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

async function scrapeR18(code) {
  const movie = {};
  const movieId = code.toLowerCase();
  const searchPage = "ul.cmn-list-product01 > li.item-list > a";
  const videoPoster = "iframe";
  const videoLink = "video > source";

  let r18MovieLink;

  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  // begin scraping
  // scrape - 1 (Search and get movie link)
  let page = await browser.newPage();
  await page.setDefaultNavigationTimeout(5000);
  await page.goto(`https://www.r18.com/common/search/searchword=${movieId}/`);
  try {
    await page.waitForSelector(searchPage);

    // use xpath / css selector
    r18MovieLink = await page.$$eval(
      searchPage,
      (elems) => elems.map((el) => el.href)[0]
    );

    // scrape - 2 (Get Video Trailer Link)
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(5000);
    await page.goto(r18MovieLink);
    await page.waitForSelector(videoLink);
    await page.waitForSelector(videoPoster);

    const r18MoviePoster = await page.$$eval(
      videoPoster,
      (elems) => elems.map((el) => el.src)[0]
    );

    const r18TrailerLink = await page.$$eval(
      videoLink,
      (elems) => elems.map((el) => el.src)[0]
    );

    movie.trailer = r18TrailerLink.replace("_sm_", "_dmb_");
    movie.poster = r18MoviePoster.split("&")[1].replace("poster=", "");
  } catch (e) {
    console.log(code + "==============" + e);
    movie.trailer = null;
    movie.poster = null;
    console.log(movie);
    return movie;
  }
  browser.close();
  console.log("test", movie);
  return movie;
}

module.exports = initDiscordBot;
