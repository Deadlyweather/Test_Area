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
    Health: "../Graphics/UI/Health_Bar.png",
    Mana: "../Graphics/UI/Mana_Bar.png",
    Xp: "../Graphics/UI/Xp_Bar.png",
    Inventory: "../Graphics/UI/Inventory.png",
    Slot: "../Graphics/UI/Slot.png",
    Equipment: "../Graphics/UI/Equipment.png",
    Equipped: "../Graphics/UI/Equipped.png",
    Empty_Head: "../Graphics/Items/Armor/Empty_Head.png",
    Empty_Chest: "../Graphics/Items/Armor/Empty_Chest.png",
    Empty_Legs: "../Graphics/Items/Armor/Empty_Legs.png",
    Empty_Feet: "../Graphics/Items/Armor/Empty_Feet.png"
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
let screenX = canvas.width
let screenY = canvas.height

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
    Experience: 100,
    Requirement: 100,
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
    maxOffset: 500,
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
    Melee_Ultimate: "Space",
    Dash: "Shift",
    // UI
    Backpack: "§",
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
// OUTPUT
// ============================================================================

document.addEventListener("keydown", (pressed) => {
    if (pressed.key === Keybinds.Backpack) {
        Inventory();
    }
});

document.addEventListener("wheel", (X) => {
    if (!opened.Backpack) return;

    ScrollInventory(X.deltaY);
});

function Inventory() {
    if (opened.Backpack === false) {
        opened.Settings = false
        opened.Devbook = false
        opened.Backpack = true
    } else {
        opened.Backpack = false
    }
}

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
// WINDOWS
// ============================================================================

let opened = {
    Settings: false,
    Backpack: false,
    Devbook: false
}

// ============================================================================
// ITEMS
// ============================================================================

let items = {}

// ============================================================================
// INVENTORY
// ============================================================================

let Backpack = {
    // Inventory
    x: centerX,
    y: 50,
    width: 600,
    height: 600,
    
    // slots
    GridPos: {x: 0, y: 50},
    SlotX: 8,
    SlotY: 8,
    SlotSize: 40,
    RollY: 0,
    SlotDistance: 8,
    // items
    Inventory: []
}

// ============================================================================
// SCROLL
// ============================================================================

function ScrollInventory(Amount) {
    Backpack.RollY += Amount

}

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
let Bar = {
    Health: {
        Location: {x: centerX * 0.65, y: centerY * 1.4},
        Width: 300,
        Height: 300,
        Color: 
            Player.Health === 1 ? "white":
            Player.Health / Player.MaxHealth <= 0.25 ? "red" :
            Player.Health / Player.MaxHealth <= 0.5 ? "yellow" :
            "green",
        // Shield
        Shield: {
            Color: "cyan",
            Overcharged: {
                Color: "magenta",
            }
        }
    },
    Mana: {
        Location: {x: centerX * 1.05, y: centerY * 1.4},
        Width: 300,
        Height: 300,
        Color: Player.Mana === Player.MaxMana ? "white" : "blue"
    },
    Xp: {
        Location: {x: centerX * 0.7, y: centerY * 1.6},
        Width: 600,
        Height: 300,
        Color: "lime"
    }
}

function Healthbar() {
    // Liquid Health
    ctx.globalAlpha = 1
    ctx.fillStyle = Bar.Health.Color
    ctx.fillRect(
        Bar.Health.Location.x * 1.025, 
        Bar.Health.Location.y * 1.2 , 
        Bar.Health.Width * 0.9 / (Player.MaxHealth / Player.Health), 
        Bar.Health.Height * 0.1)
    // Liquid Shield
    ctx.globalAlpha = Bar.Health.Shield.Transparency;
    ctx.fillStyle = Bar.Health.Shield.Color
    ctx.fillRect(
        Bar.Health.Location.x * 1.025,
        Bar.Health.Location.y * 1.2, 
        Bar.Health.Width * 0.9 * (Player.Shield > Player.MaxHealth ? 1 : Player.Shield / Player.MaxHealth), 
        Bar.Health.Height * 0.05
    )
    ctx.globalAlpha = 1;
    // Liquid OverCharge
    if (Player.Shield > Player.MaxHealth) {
        ctx.fillStyle = Bar.Health.Shield.Overcharged.Color
        ctx.fillRect(
            Bar.Health.Location.x * 1.025, 
            Bar.Health.Location.y * 1.2, 
            Bar.Health.Width * 0.9 * ((Player.Shield - Player.MaxHealth) / Player.MaxHealth > 1 ? 1 : (Player.Shield - Player.MaxHealth) / Player.MaxHealth),
            Bar.Health.Height * 0.05
        )
    }
    // Bar
    ctx.drawImage(images.Health,
        Bar.Health.Location.x,
        Bar.Health.Location.y,
        Bar.Health.Width,
        Bar.Health.Height,
    )
}

function ManaBar() {
    // Liquid
    ctx.fillStyle = Bar.Mana.Color
    ctx.fillRect(Bar.Mana.Location.x * 1.0475, Bar.Mana.Location.y * 1.18 , Bar.Mana.Width * 0.7 / (Player.MaxMana / Player.Mana), Bar.Mana.Height * 0.2)
    // Bar
    ctx.drawImage(images.Mana,
        Bar.Mana.Location.x,
        Bar.Mana.Location.y,
        Bar.Mana.Width,
        Bar.Mana.Height
    )
}
function XpBar() {
    // Liquid
    ctx.fillStyle = Bar.Xp.Color
    ctx.fillRect(
        Bar.Xp.Location.x * 1.2425, 
        Bar.Xp.Location.y * 1.175, 
        Bar.Xp.Width * 0.46 / (Player.Requirement / Player.Experience), 
        Bar.Xp.Height * 0.1)
    // Bar
    ctx.drawImage(
        images.Xp,
        Bar.Xp.Location.x,
        Bar.Xp.Location.y,
        Bar.Xp.Width,
        Bar.Xp.Height
    )
}

function OpenBackpack() {
    ctx.drawImage(
        images.Inventory,
        Backpack.x,
        Backpack.y,
        Backpack.width,
        Backpack.height
    )
    Slots()
}

function Slots() {
    for (let plotY = 0; plotY < Backpack.SlotY; plotY++) {
        for (let plotX = 0; plotX < Backpack.SlotX; plotX++) {

            const slotX =
                Backpack.x +
                Backpack.GridPos.x +
                plotX * (Backpack.SlotSize + Backpack.SlotDistance);

            const slotY =
                Backpack.y +
                Backpack.GridPos.y +
                plotY * (Backpack.SlotSize + Backpack.SlotDistance) +
                Backpack.RollY;

            ctx.drawImage(
                images.Slot,
                slotX,
                slotY,
                Backpack.SlotSize,
                Backpack.SlotSize
            );
        }
    }
}

function AddRow() {
    Backpack.SlotY++;
}
// ============================================================================
// DRAW
// ============================================================================

function Draw() {
    CreateBackground()
    Healthbar()
    ManaBar()
    XpBar()
    if (opened.Backpack === true) {
        OpenBackpack()
    }
}

// ============================================================================
// GAME
// ============================================================================
function Game() {
    Draw()
    requestAnimationFrame(Game)
}

// ============================================================================
// START
// ============================================================================
loadImages(images).then(loaded => {
    images = loaded;
    Game();
}).catch(err => {
    console.error(err);
});