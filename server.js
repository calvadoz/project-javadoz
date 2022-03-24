const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();
const initDiscordBot = require("./discord");
const addNewCode = require("./outputCode");

app.use(express.json());
app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/api/healthcheck", (req, res) => {
  //   addNewCode("");
  res.status(200).send("Nothing here.. Just to check if the server is healthy");
});

app.listen(process.env.PORT || 4000, () => console.log("Server is running"));
initDiscordBot();
