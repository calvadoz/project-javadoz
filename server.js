require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

const initDiscordBot = require("./discord");
const axios = require("axios");
const {
  scrapeJavHD,
  scrapeR18,
  scrapeR18Actress,
  scrapeJavDbActress,
} = require("./scraper");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(helmet());
app.use("/static", express.static("assets", { maxAge: 3600000 }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/healthcheck", (req, res) => {
  res.status(200).send("Nothing here.. Just to check if the server is healthy");
});

app.get("/api/get-version", async (req, res) => {
  res.send(
    process.env.HEROKU_RELEASE_VERSION
      ? process.env.HEROKU_RELEASE_VERSION
      : "development"
  );
});

app.get("/api/get-movie-metadata", async (req, res) => {
  const movieId = req.query.movieId;
  const movieDetails = await getSingleMovie(movieId);
  res.send(movieDetails);
});

app.get("/api/get-actress-details", async (req, res) => {
  const actressName = req.query.name;
  const actressR18Url = req.query.url;
  const scrapeResult = await getActressDetails(actressName, actressR18Url);
  console.log(scrapeResult);
  res.send(scrapeResult);
});

async function getActressDetails(actressName, url) {
  let actressDetails = [];
  try {
    const javDbResult = await scrapeJavDbActress(actressName);
    actressDetails = javDbResult;
    const r18Result = await scrapeR18Actress(url);
    if (r18Result.length <= 15) {
      actressDetails.trailers = r18Result;
    } else {
      actressDetails.trailers = r18Result.slice(0, 15);
    }
    return actressDetails;
  } catch (err) {
    return null;
  }
}

async function getSingleMovie(code) {
  let movie = {};
  try {
    const r18Result = await scrapeR18(code);
    movie = { ...r18Result };
  } catch (err) {
    throw new Error("Fetching from r18 failed ", err.message);
  }
  return movie;
}

// migrate data from one document to another
async function updateData() {
  // const allMovies = await axios.get(
  //   process.env.FIREBASE_URL + "jav-movies-db.json"
  // );
  // const data = allMovies.data;
  // let dataList = [];
  // for (const key in data) {
  //   dataList.push(data[key]);
  // }
  // dataList = dataList.slice(
  //   dataList.findIndex((x) => x.movieId === "WFR-020"),
  //   dataList.length
  // );
  // console.log(dataList.length);
  // const allMovies = await axios.get(
  //   process.env.FIREBASE_URL + "jav-movies-db.json"
  // );
  // const data = allMovies.data;
  // let i = 0;
  // for (let testD of dataList) {
  //   const r18metadata = await scrapeR18(testD.movieId);
  //   if (r18metadata.poster) {
  //     await axios.post(process.env.FIREBASE_URL + "jav-movies-database.json", {
  //       guid: uuidv4(),
  //       movieId: testD.movieId,
  //       requester: testD.requester,
  //       timestamp: testD.timestamp,
  //       trailer: testD.trailer,
  //       thumbnail: testD.thumbnail,
  //       watchCount: testD.watchCount,
  //       actresses: r18metadata.actresses,
  //       genres: r18metadata.genres,
  //       studio: r18metadata.studio,
  //       title: r18metadata.title,
  //       releaseDate: r18metadata.releaseDate,
  //       length: r18metadata.length,
  //     });
  //     console.log("Pushed movies: ", testD.movieId);
  //     console.log("Current Index: ", i++);
  //   }
  // }
}

app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
// updateData();
// scrapeJavDbActress('naruha-sakai');
initDiscordBot();
