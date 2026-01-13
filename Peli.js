// ==================== Ruutu ==================== //

const canvas = document.getElementById("TestArea")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)

// ==================== Pelaaja ==================== //

let Player = {
    position: {
        x: canvas.width / 2,
        y: canvas.height / 2
    },
    appearance: {
        color: "white",
        size: 20,
        shape: "Circle"
    }
}

function Spawn(player) {
    ctx.fillStyle = player.appearance.color

    ctx.beginPath()
    ctx.arc(
        player.position.x,
        player.position.y,
        player.appearance.size,
        0,
        Math.PI * 2
    )
    ctx.fill()
}

Spawn(Player)

// ==================== Maailma ==================== //

let Grid = {
    size: 50,
    color: "white"
}

function Devmode(camera) {
    ctx.strokeStyle = Grid.color
    ctx.lineWidth = 1

    const startX = Math.floor(camera.x / Grid.size) * Grid.size
    const startY = Math.floor(camera.y / Grid.size) * Grid.size

    for (let x = startX; x < camera.x + canvas.width; x += Grid.size) {
        ctx.beginPath()
        ctx.moveTo(x - camera.x, 0)
        ctx.lineTo(x - camera.x, canvas.height)
        ctx.stroke()
    }

    for (let y = startY; y < camera.y + canvas.height; y += Grid.size) {
        ctx.beginPath()
        ctx.moveTo(0, y - camera.y)
        ctx.lineTo(canvas.width, y - camera.y)
        ctx.stroke()
    }
}