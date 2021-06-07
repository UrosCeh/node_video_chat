const express = require("express")
const path = require("path")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const uuid = require("uuid")

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))

// app.get("/", (req, res) => {
// 	res.redirect(`/${uuid.v4()}}`)
// })

app.get("/chat/:room/:username", (req, res) => {
	res.render("room", { roomId: req.params.room, username: req.params.username })
	// res.sendFile(path.join(__dirname, "public/room.html"))
})

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, username) => {
		socket.join(roomId)
		socket.broadcast.to(roomId).emit("user-connected", userId)

		// Display welcome and leave messages?

		//Send message, display to me from client side, to others from server
		socket.on("send-message", (msg) => {
			console.log(msg, roomId)
			socket.broadcast.to(roomId).emit("chat-message", msg, username)
		})

		socket.on("disconnect", () => {
			socket.broadcast.to(roomId).emit("user-disconnected", userId)
		})
	})
})

server.listen(3000)
