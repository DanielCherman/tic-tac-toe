let game = {
  gameActive: true,
  player: "X",
  gameState: ["", "", "", "", "", "", "", "", ""],
};

const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use("/", require("express").static(path.join(__dirname, "dist")));

const gameUpdate = (state, playerId) => {
  io.emit("gameUpdate", state, playerId);
  game = state;
  console.log("gameUpdate", state, playerId);
};

io.on("connection", (socket) => {
  console.log("player connected:", socket.id);
  socket.on("gameUpdate", (game) => gameUpdate(game, socket.id));
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
