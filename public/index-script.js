const joinForm = document.getElementById("join-room-form")
const createForm = document.getElementById("create-room-form")

joinForm.addEventListener("submit", (e) => {
	e.preventDefault()
	let privateRoomKey = e.target.privateRoom.value.trim()

	if (privateRoomKey !== "" && isPrivateRoomKeyValid(privateRoomKey)) {
		window.location.pathname = `chat/${privateRoomKey}`
	} else {
		alert("Not a valid private room key!")
	}
})

createForm.addEventListener("submit", (e) => {
	e.preventDefault()

	let room = Math.random().toString(36).substr(2, 11)

	window.location.pathname = `chat/${room}`
})

function isPrivateRoomKeyValid(key) {
	const re = /^[0-9a-z]{10,11}$/
	return re.test(key)
}
