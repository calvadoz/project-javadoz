require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();

const initDiscordBot = require("./discord");
const axios = require("axios");
const javbus = require("node-javbus")();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use("/static", express.static("assets", { maxAge: 3600000 }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/healthcheck", (req, res) => {
  res.status(200).send("Nothing here.. Just to check if the server is healthy");
});

app.get("/api/get-movie-details", async (req, res) => {
  const movies = [];
  try {
    const allMovies = await axios.get(
      process.env.FIREBASE_URL + "jav-movies-r18.json"
    );
    const data = allMovies.data;
    for (const key in data) {
      console.log("Getting movie details for movie ", data[key].movieId);
      const movie = await getSingleMovie(data[key].movieId);
      movie.requester = data[key].requester;
      movie.timestamp = data[key].timestamp;
      movie.thumbnail = data[key].thumbnail ? data[key].thumbnail : null;
      movie.trailer = data[key].trailer ? data[key].trailer : null;
      movies.push(movie);
    }
  } catch (err) {
    console.log("Request failed... ", err);
  }

  res.send(movies);
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
    const javbusResult = await queryJAVBus(code);
    movie.movieId = javbusResult.id;
    movie.title = javbusResult.title;
    movie.actresses = javbusResult.stars.map((star) => star.name).join(", ");
    movie.genre = javbusResult.genre;
    movie.studio = javbusResult.studio;
    movie.releaseDate = javbusResult.release_date;
    movie.length = javbusResult.length;
    axios
      .get("https://www2.javhdporn.net/video/tysf-002/")
      .then((response) => {
        console.log(response.status);
      })
      .catch((error) => {
        console.log(error); //Logs a string: Error: Request failed with status code 404
      });
  } catch (err) {
    throw new Error("Fetching from javbus failed ", err.message);
  }
  // writeFile(movie.cover, movie.id);
  // write png binary on the fly
  // const thumbReq = await axios.get(movie.cover, {
  //   responseType: "arraybuffer",
  // });
  // movie.base64thumb = Buffer.from(thumbReq.data, "binary").toString("base64");
  return movie;
}

function queryJAVBus(code) {
  try {
    return javbus.show(code).catch((e) => console.log(e));
  } catch (e) {
    throw new error("Got error la", e);
  }
}

// migrate data from one documen to another
async function updateData() {
  // const movies = [];
  // for (let i = 0; i < data.length; i++) {
  //   const r18movieReq = await scrapeR18(data[i].id);
  //   await axios.post(
  //     "https://project-c-dd6df-default-rtdb.firebaseio.com/jav-movies-r18.json",
  //     {
  //       movieId: data[i].id,
  //       requester: data[i].requester,
  //       timestamp: data[i].timestamp,
  //       trailer: r18movieReq.trailer,
  //       thumbnail: r18movieReq.poster,
  //     }
  //   );
  // }
  // console.log(movies);
}

app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
// updateData();
initDiscordBot();
