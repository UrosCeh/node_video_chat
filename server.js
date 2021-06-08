const express = require("express")
const path = require("path")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const uuid = require("uuid")

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))

app.get("/chat/:room", (req, res) => {
	res.render("room", { roomId: req.params.room })
})

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId) => {
		socket.join(roomId)
		socket.broadcast.to(roomId).emit("user-connected", userId)

		socket.on("send-message", (msg) => {
			socket.broadcast.to(roomId).emit("chat-message", msg)
		})

		socket.on("disconnect", () => {
			socket.broadcast.to(roomId).emit("user-disconnected", userId)
		})
	})
})

server.listen(3000)
