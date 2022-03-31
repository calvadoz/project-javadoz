require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");

const app = express();
const initDiscordBot = require("./discord");
const addNewCode = require("./outputCode");
const axios = require("axios");

const javbus = require("node-javbus")();

app.use(cors());
app.use(express.json());
app.use("/static", express.static("assets", { maxAge: 3600000 }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/healthcheck", (req, res) => {
  //   addNewCode("");
  res.status(200).send("Nothing here.. Just to check if the server is healthy");
});

app.get("/api/roll-movies", async (req, res) => {
  const movies = [];
  for (let i = 0; i < 10; i++) {
    const randomPage = Math.floor(Math.random() * 150);
    const randomPageResults = await javbus.page(randomPage);
    const randomizeMovieResult = randomizeAndFetch(randomPageResults);
    const movie = await getSingleMovie(randomizeMovieResult.id);
    movies.push(movie);
  }
  res.send(movies);
});

app.get("/api/get-movie-details", async (req, res) => {
  const movies = [];
  const allMovies = await axios.get(process.env.FIREBASE_URL);
  const data = allMovies.data;
  for (const key in data) {
    const movie = await getSingleMovie(data[key].movieId);
    movie.requester = data[key].requester;
    movie.timestamp = data[key].timestamp;
    console.log("Pushing movie ", movie.id);
    movies.push(movie);
  }
  res.send(movies);
  // res.set("Access-Control-Allow-Origin", "https://javbus.com");
});

async function getSingleMovie(code) {
  let movie = {};
  const javbusResult = await queryJAVBus(code);
  movie.id = javbusResult.id;
  movie.title = javbusResult.title;
  movie.actresses = javbusResult.stars.map((star) => star.name).join(", ");
  movie.cover = javbusResult.cover;
  movie.genre = javbusResult.genre;
  movie.label = javbusResult.label;
  // writeFile(movie.cover, movie.id);
  const thumbReq = await axios.get(movie.cover, {
    responseType: "arraybuffer",
  });
  movie.base64thumb = Buffer.from(thumbReq.data, "binary").toString("base64");
  return movie;
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

async function writeFile(coverUrl, movieId) {
  const fileName = `${__dirname}\\assets\\${movieId.toLowerCase()}.jpg`;
  console.log("File Name: ", fileName);
  try {
    if (fs.existsSync(fileName)) {
      return;
    } else {
      const thumbReq = await axios.get(coverUrl, {
        responseType: "arraybuffer",
      });
      const data = thumbReq.data;
      fs.appendFile(fileName, Buffer.from(data), (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}


app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
initDiscordBot();
