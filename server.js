const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();
const initDiscordBot = require("./discord");
const addNewCode = require("./outputCode");

const javbus = require("node-javbus")();

app.use(express.json());
app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

app.get("/api/healthcheck", (req, res) => {
  //   addNewCode("");
  res.status(200).send("Nothing here.. Just to check if the server is healthy");
});

app.get("/api/roll-movies", async (req, res) => {
  const movies = [];
  for (let i = 0; i < 20; i++) {
    const randomPage = Math.floor(Math.random() * 150);
    const randomPageResults = await javbus.page(randomPage);
    const randomizeMovieResult = randomizeAndFetch(randomPageResults);
    console.log(randomizeMovieResult);
    movies.push({
      id: randomizeMovieResult.id,
      title: randomizeMovieResult.name,
      cover: "https://javbus.com" + randomizeMovieResult.img,
    });
  }
  res.send(movies);
});

function randomizeAndFetch(codes) {
  if (codes) {
    const randomLine = Math.floor(Math.random() * codes.length); // Math.floor(0 - 1 * 2000xx)
    return codes[randomLine];
  }
  return "Bo code liao...";
}

app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
initDiscordBot();
