const express = require("express")
const path = require("path")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const uuid = require("uuid")
const { userJoin, userLeave, isRoomFull } = require("./utils/users")

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))

app.get("/chat/:room", (req, res) => {
	if (isRoomFull(req.params.room)) {
		res.render("404", { error: `Room ${req.params.room} is full` })
	}

	;/^[0-9a-z]{10,11}$/.test(req.params.room)
		? res.render("room", { roomId: req.params.room })
		: res.render("404", { error: `Invalid room id: ${req.params.room}` })
})

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId) => {
		const user = userJoin(userId, roomId)
		socket.join(user.room)

		socket.broadcast.to(user.room).emit("user-connected", user.id)

		socket.on("send-message", (msg) => {
			socket.broadcast.to(user.room).emit("chat-message", msg)
		})

		socket.on("disconnect", () => {
			socket.broadcast.to(user.room).emit("user-disconnected", user.id)
			userLeave(user.id)
		})
	})
})

server.listen(3000)
