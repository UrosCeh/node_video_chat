const form = document.getElementById("join-room-form")

form.addEventListener("submit", (e) => {
	e.preventDefault()
	let username = e.target.username.value.trim()
	let privateRoom = e.target.privateRoom.value.trim()
	let room = e.target.room.value
	if (room === "create_private_room") {
		room = Math.random().toString(36).substr(2, 11)
	}

	if (privateRoom === "") {
		window.location.pathname = `chat/${room}/${username}`
	} else {
		window.location.pathname = `chat/${privateRoom}/${username}`
	}
})
