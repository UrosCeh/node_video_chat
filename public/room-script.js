const socket = io("/")
const myVideo = document.getElementById("my-video")
const chatMessages = document.getElementById("chat-messages")
const chatFooter = document.getElementById("chat-footer")
const chatForm = document.getElementById("chat-form")
const peerVideos = document.getElementById("video-chat")
const peer = new Peer(undefined, {
	host: "/",
	port: "3001"
})

const peers = {}

chatForm.addEventListener("submit", (e) => {
	e.preventDefault()

	const msg = e.target.elements.msg.value
	socket.emit("send-message", msg)

	outputMessage(msg, true)

	e.target.elements.msg.value = ""
	e.target.elements.msg.focus()
})

peer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id)
	outputMessage("You entered the chat")
})

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true
	})
	.then((stream) => {
		addMyStream(stream)

		peer.on("call", (call) => {
			call.answer(stream)

			call.on("stream", (userVideoStream) => {
				addPeerStream(userVideoStream, call.peer)
			})
		})

		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream)
			outputMessage("New user entered the chat")
		})
	})

socket.on("chat-message", (msg) => {
	outputMessage(msg, false, true)
})

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close()
})

socket.on("room-full-error", (msg) => {
	alert(msg)
	window.location.path = "/"
	// setTimeout(() => {
	// }, 3000)
})

function connectToNewUser(userId, stream) {
	const call = peer.call(userId, stream)
	peers[userId] = call
	call.on("stream", (userVideoStream) => {
		addPeerStream(userVideoStream, userId)
	})

	call.on("close", () => {
		removePeerStream()
	})
}

function addMyStream(stream) {
	const myVideoStream = document.createElement("video")
	myVideoStream.muted = true
	myVideoStream.srcObject = stream
	myVideoStream.addEventListener("loadedmetadata", () => {
		myVideoStream.play()
	})

	myVideo.appendChild(myVideoStream)
}

function addPeerStream(stream, id) {
	const video = document.createElement("video")
	video.srcObject = stream
	if (document.getElementById(id) != null) {
		console.log("return")
		return
	}
	video.id = id
	video.addEventListener("loadedmetadata", () => {
		video.play()
	})

	peerVideos.append(video)
}

function removePeerStream() {
	document.querySelector("#video-chat").innerHTML = ""
}

function setChatMessagesHeightDynamically() {
	const divHeight = window.innerHeight - myVideo.offsetHeight - chatFooter.offsetHeight
	console.log(myVideo.offsetHeight)
	chatMessages.style.height = `${divHeight}px`
}
window.addEventListener("resize", setChatMessagesHeightDynamically)

function outputMessage(msg, my, peer) {
	const div = document.createElement("div")
	if (my) {
		div.classList.add("my-message")
		setChatMessagesHeightDynamically()
	} else if (peer) {
		div.classList.add("peer-message")
		setChatMessagesHeightDynamically()
	} else {
		div.classList.add("bot-message")
	}
	const p = document.createElement("p")
	p.innerText = msg
	div.appendChild(p)
	chatMessages.appendChild(div)

	chatMessages.scrollTop = chatMessages.scrollHeight
}
