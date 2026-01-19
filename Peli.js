// ============================================================================
// CANVAS
// ============================================================================
const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ============================================================================
// BACKGROUND
// ============================================================================

let background = {
    color: "black",
    width: canvas.width = window.innerWidth,
    height: canvas.height = window.innerHeight
}

function CreateBackground() {
    ctx.fillStyle = background.color
    ctx.fillRect( 0, 0, background.width, background.height )
}

// ============================================================================
// IMAGES
// ============================================================================

let images = {
    Bar: "../Graphics/Bar.png",
    Health: "../Graphics/Health.png"
}

// ============================================================================
// IMAGE LOADER
// ============================================================================

function loadImages(imageList) {
    let loadedImages = {};
    let promises = [];

    for (let key in imageList) {
        promises.push(new Promise((resolve, reject) => {
            let img = new Image();
            img.src = imageList[key];

            img.onload = () => resolve({ key, img });
            img.onerror = () => reject(new Error("Image failed to load: " + imageList[key]));
        }));
    }

    return Promise.all(promises).then(results => {
        results.forEach(result => {
            loadedImages[result.key] = result.img;
        });
        return loadedImages;
    });
}

// ============================================================================
// TIME
// ============================================================================

let timeScale = 1; 
let time = 0; // Pelin aika

// ============================================================================
// Deadlyweather
// ============================================================================

// ============================================================================
// Custom positions
// ============================================================================

// Centers
let centerX = canvas.width / 2
let centerY = canvas.height / 2

// ============================================================================
// Custom sizes
// ============================================================================

// ============================================================================
// PLAYER
// ============================================================================

let Player = {
    position: { x: 0, y: 0 },
    appearance: { size: 20 },
    // Visual
    MaxHealth: 10,
    Health: 10,
    Shield: 0,
    MaxMana: 1,
    Mana: 1,
    Level: 0,
    experience: 0,
    // Hidden
    stats: { Strength: 1, Agility: 1, Intelligence: 1, Vitality: 0 },
    points: 0
};

// ============================================================================
// CURSOR
// ============================================================================

let Cursor = {
    position: { x: 0, y: 0 }
}

// ============================================================================
// CAMERA
// ============================================================================

let camera = {
    position: { x: 0, y: 0 },
    screen: { x: centerX, y: centerY },
    offset: { x: 0, y: 0 },
    maxOffset: 360,
};

// ============================================================================
// INPUT
// ============================================================================

let Keys = {}

let Keybinds = {
    // Important
    Settings: "o",
    // Movement
    MoveNorth: "w",
    MoveWest: "a",
    MoveSouth: "s",
    MoveEast: "d",
    // Combat
    Ranged: "Mouse1",
    Ranged_Ultimate: "Ctrl",
    Melee: "Mouse2",
    Melee_ULtimate: "Space",
    Dash: "Shift",
    // UI
    Inventory: "§",
    HotbarKeys: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "0"
    },
    Interact: "e",
    Skills: "l",
    // Info
    Devbook: "p"
};

// ============================================================================
// WEAPON
// ============================================================================

let Ranged = {
    Cost: 1,
    Size: 1,
    Count: 1,
    Pierce: 0,
    Rate: 1,
    Speed: 1,
    Range: 25
}

let Ranged_Ultimate = {
    Cost: 10,
    Size: 1,
    Pierce: 0,
    Duration: 1,
    Cooldown: 60
}

let Melee = {
    Cost: 0,
    Rate: 5,
    Size: 90,
    Speed: 1,
    Range: 25
}

let Melee_Ultimate = {
    Cost: 0,
    Size: 360,
    Range: 100,
    Duration: 0,
    Cooldown: 60
}

let Dash = {
    Cost: 0,
    Range: 10,
    Duration: 0
}

// ============================================================================
// ITEMS
// ============================================================================

let items = {}

// ============================================================================
// Inventory
// ============================================================================

let Inventory = {}

// ============================================================================
// Equipment
// ============================================================================

let Equipment = {
    Head: {},
    Body: {},
    Legs: {},
    Feet: {}
}

let Artifacts = {}

// ============================================================================
// Hotbar
// ============================================================================

let Hotbar = {}

let selectedSlot = null;

// ============================================================================
// UI
// ============================================================================

// Player
let Hp = {
    Health: {
        location: {x: centerX * 0.45, y: centerY * 1.5},
        Width: 100,
        Height: 100,
        rotation: 45
    },
    Bar: {
        location: {x: centerX * 0.5, y: centerY * 1.5},
        Width: 400,
        Height: 100
    }
}

function Healthbar() {
    ctx.drawImage(images.Bar,
        Hp.Bar.location.x,
        Hp.Bar.location.y,
        Hp.Bar.Width,
        Hp.Bar.Height,
    )
    ctx.drawImage(images.Health,
        Hp.Health.location.x,
        Hp.Health.location.y,
        Hp.Health.Width,
        Hp.Health.Height,
    )
}

// ============================================================================
// DRAW
// ============================================================================

function Draw() {
    CreateBackground()
    Healthbar()
}

// ============================================================================
// GAME
// ============================================================================
function Game() {
    Draw()
    requestAnimationFrame(Game)
}

loadImages(images).then(loaded => {
    images = loaded;
    Game();
}).catch(err => {
    console.error(err);
});