require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

const initDiscordBot = require("./discord");
const axios = require("axios");
const { scrapeJavHD, scrapeR18 } = require("./scraper");

var allowedOrigins = ["http://localhost:3000", "https://calvadoz.github.io"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
// app.use(cors());
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
  const allMovies = await axios.get(
    process.env.FIREBASE_URL + "jav-movies-database.json"
  );
  const data = allMovies.data;
  for (const key in data) {
    await axios.post(process.env.FIREBASE_URL + "jav-movies-db.json", {
      guid: uuidv4(),
      movieId: data[key].movieId,
      requester: data[key].requester,
      timestamp: data[key].timestamp,
      trailer: data[key].trailer,
      thumbnail: data[key].thumbnail,
      watchCount: 0,
    });
    console.log("Pushed movies: ", data[key].movieId);
  }
}

app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
// updateData();
// scrapeR18('pfes-055');
// initDiscordBot();
