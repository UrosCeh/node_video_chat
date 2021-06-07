const socket = io("/")
const myVideo = document.getElementById("my-video")
const chatMessages = document.getElementById("chat-messages")
const chatFooter = document.getElementById("chat-footer")
const chatForm = document.getElementById("chat-form")
const peerVideos = document.getElementById("video-chat")
const myPeer = new Peer(undefined, {
	host: "/",
	port: "3001"
})
const myStream = document.createElement("video")

const peers = {}

chatForm.addEventListener("submit", (e) => {
	e.preventDefault()

	const msg = e.target.elements.msg.value
	socket.emit("send-message", msg)

	outputMessage(msg)

	e.target.elements.msg.value = ""
	e.target.elements.msg.focus()
})

myStream.muted = true
myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id, USERNAME)
})

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true
	})
	.then((stream) => {
		addVideoStream(myStream, stream, true)

		myPeer.on("call", (call) => {
			// provides call callback
			call.answer(stream) // answering the call with our MediaStream (optional)

			const video = document.createElement("video")
			call.on("stream", (userVideoStream) => {
				// add all the users who are already in the call
				addVideoStream(video, userVideoStream, false)
			})
		})

		socket.on("user-connected", (userId) => {
			// add all users who connected after us
			connectToNewUser(userId, stream)
		})
	})

socket.on("chat-message", (msg, username) => {
	outputMessage(msg, username)
})

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close()
})

function connectToNewUser(userId, stream) {
	const video = document.createElement("video")
	const call = myPeer.call(userId, stream) // userID is mypeerId and we are providing our mediaStream
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream, false)
	})
	call.on("close", () => {
		video.remove()
	})

	peers[userId] = call
}

function addVideoStream(video, stream, my) {
	console.log("called")
	video.srcObject = stream
	video.addEventListener("loadedmetadata", () => {
		video.play()
	})
	if (my) myVideo.append(video)
	else peerVideos.append(video)
	// setChatMessagesHeightDynamically()
}

function setChatMessagesHeightDynamically() {
	const divHeight = window.innerHeight - document.getElementById("my-video").offsetHeight - chatFooter.offsetHeight
	chatMessages.style.height = `${divHeight}px`
}
window.addEventListener("resize", setChatMessagesHeightDynamically)
// document.addEventListener("DOMContentLoaded", setChatMessagesHeightDynamically)

function outputMessage(msg, peer) {
	console.log(peers)
	const div = document.createElement("div")
	if (!peer) {
		div.classList.add("my-message")
	} else {
		div.classList.add("peer-message")
		const span = document.createElement("span")
		span.innerText = `${peer}`
		div.appendChild(span)
	}
	const p = document.createElement("p")
	p.innerText = msg
	div.appendChild(p)
	chatMessages.appendChild(div)
}
