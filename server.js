const { v4: uuidV4 } = require("uuid");
const express = require("express");
const { Socket } = require("socket.io");
const app = express();
// var ExpressPeerServer = require("peer").ExpressPeerServer;
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");

// 원래것
app.use(express.static("public"));
// 바꾼것
// app.use(
//   "/peer",
//   ExpressPeerServer(server, {
//     allow_discovery: true,
//     debug: !!process.env.DEBUG,
//   })
// );

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected", userId);
    io.to(roomId).emit("user-connected", userId);
    // io.to(roomId).emit("conn", userId);
    socket.on("disconnect", () => {
      //   socket.to(roomId).broadcast.emit("user-disconnected", userId);
      io.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(12345);
