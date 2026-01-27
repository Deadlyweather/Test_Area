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
    // Bar
    Health: "../Graphics/UI/Health_Bar.png",
    Mana: "../Graphics/UI/Mana_Bar.png",
    Xp: "../Graphics/UI/Xp_Bar.png",
    // Inventory
    Inventory: "../Graphics/UI/Inventory.png",
    Slot: "../Graphics/UI/Slot.png",
    // Armor
    Empty: "../Graphics/UI/Equipment.png",
    Equipped: "../Graphics/UI/Equipped.png",
    Empty_Head: "../Graphics/Items/Armor/Empty_Head.png",
    Empty_Chest: "../Graphics/Items/Armor/Empty_Chest.png",
    Empty_Legs: "../Graphics/Items/Armor/Empty_Legs.png",
    Empty_Feet: "../Graphics/Items/Armor/Empty_Feet.png",
    // Devbook
    Body: "../Graphics/UI/Devbook/Body.png",
    Close: "../Graphics/UI/Devbook/Close.png",
    Back: "../Graphics/UI/Devbook/Back.png",

    Art: "../Graphics/UI/Devbook/Art.png",
    Armor: "../Graphics/UI/Devbook/Armor.png",
    Items: "../Graphics/UI/Devbook/Items.png",
    Stats: "../Graphics/UI/Devbook/Combat.png",

    Item: "../Graphics/UI/Devbook/Item_logs.png",
    Consumeable: "../Graphics/UI/Devbook/Consumeable.png",
    Materials: "../Graphics/UI/Devbook/Materials.png",
    Equipment: "../Graphics/UI/Devbook/Equipment.png",

    Stat: "../Graphics/UI/Devbook/Stat_sheet.png",
    Attributes: "../Graphics/UI/Devbook/Attributes.png",
    Combat: "../Graphics/UI/Devbook/Combat.png",
    Movement: "../Graphics/UI/Devbook/Movement.png"

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
// Fonts
// ============================================================================

const FontsList = {
  Player: {
    src: "../Graphics/Fonts/Orange_Text.png",
    chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`,
    size: 8
  },

  Enemy: {
    src: "../Graphics/Fonts/Orange_Text.png",
    chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`,
    size: 8
  },

  Info: {
    src: "../Graphics/Fonts/Orange_Text.png",
    chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`,
    size: 8
  },

  Deadlyweather: {
    src: "../Graphics/Fonts/Orange_Text.png",
    chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`,
    size: 16
  }
};

function loadFont(fontName) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = FontsList[fontName].src;

    img.onload = () => {
      FontsList[fontName].image = img;
      resolve();
    };

    img.onerror = () => {
      reject(new Error("Font failed to load: " + FontsList[fontName].src));
    };
  });
}

function loadFonts() {
  const fontNames = Object.keys(FontsList);
  return Promise.all(fontNames.map(name => loadFont(name)));
}

function drawText(ctx, fontName, text, x, y, scale = 1) {
  const font = FontsList[fontName];
  if (!font || !font.image) return;

  const size = font.size;
  const lines = text.split("\n");

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];

    for (let i = 0; i < line.length; i++) {
      const idx = font.chars.indexOf(line[i]);
      if (idx === -1) continue;

      ctx.drawImage(
        font.image,
        idx * size, 0,
        size, size,
        x + i * size * scale,
        y + l * size * scale,
        size * scale, size * scale
      );
    }
  }
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
    Confirm: "Enter",
    // Info
    Devbook: "p",
    // Hitboxes
    Hitbox: "i",
    // Commandbar
    Chat: "t"
};

// ============================================================================
// OUTPUT
// ============================================================================

document.addEventListener("keydown", (pressed) => {
    /*
    if (pressed.key === Keybinds.) {
    
    }
    */
    if (pressed.key === Keybinds.Backpack) {
        Inventory()
    }
    if (pressed.key === Keybinds.Devbook) {
        OpenDevbook()
    }
    if (pressed.key === Keybinds.Hitbox) {
        ToggleHitbox()
    }
    if (pressed.key === Keybinds.Chat) {
        ToggleChat()
    }
});

document.addEventListener("wheel", (X) => {
    if (!opened.Backpack) return;

    ScrollInventory(X.deltaY);
});
/*
if (opened. === false) {
        opened.Settings = false
        opened.Devbook = false
        opened.Backpack = false
    } else {
        opened. = false
    }
*/

function Inventory() {
    if (opened.Backpack === false) {
        opened.Settings = false
        opened.Devbook = false
        opened.Backpack = true
    } else {
        opened.Backpack = false
    }
}

function OpenDevbook() {
    if (opened.Devbook === false) {
        opened.Settings = false
        opened.Devbook = true
        opened.Backpack = false
    } else {
        opened.Devbook = false
    }
}

// section 2

function ToggleHitbox() {
    if (opened.Hitboxes === false) {
        opened.Hitboxes = true
    } else {
        opened.Hitboxes = false
    }
}
function ToggleChat() {
    if (opened.Chat === false) {
        opened.Chat = true
    } else {
        opened.Chat = false
    }
}

// ============================================================================
// Hitboxes
// ============================================================================

let Hitbox = {
    Hitboxes: [],
    Tags: {
        Collision: false,
        UI: false,
        Interactable: false
    },
}

function SpawnHitbox(x, y, width, height, tags = [] ) {
    if (Chat.hitbox.Tags.includes("UI")) {
        Hitbox.Hitboxes.push({
            x,
            y,
            width,
            height,
            Tags: tags
        })
    }
}

// ============================================================================
// Chat
// ============================================================================

let Chat = {
    open: false,
    input: "",
    messages: [],
    user: "Deadlyweather",
    scroll: 0,
    hitbox: {
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        Tags: ["UI"]
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
    Devbook: false,
    Hitboxes: false,
    Chat: false,
}

// ============================================================================
// Devbook
// ============================================================================

let Devbook = {
    open: false,
    activeTab: "Art",
    x: centerX / 1.5,
    y: centerY / 8,
    size: 600,
    scroll: 0,

    tabSize: { w: 128, h: 64 },

    selector: {
        get x() {
            return Devbook.x + Devbook.size + 5;
        },
        get y() {
            return Devbook.y;
        },
    },

    tabs: [
        {
            id: "Art",
            title: "Art",
            tabs: [
                { id: "Art_Armor", title: "Armor" },
                { id: "Art_Items", title: "Items" },
                { id: "Art_Materials", title: "Materials" }
            ]
        },
        {
            id: "Item",
            title: "Items",
            tabs: [
                { id: "Items_Consumables", title: "Consumables" },
                { id: "Items_Materials", title: "Materials" },
                { id: "Items_Equipment", title: "Equipment" }
            ]
        },
        {
            id: "Stat",
            title: "Stats",
            tabs: [
                { id: "Stats_Attributes", title: "Attributes" },
                { id: "Stats_Combat", title: "Combat" },
                { id: "Stats_Movement", title: "Movement" }
            ]
        }
    ],

    hitboxes: []
};

// ============================================================================
// ITEMS
// ============================================================================

let items = {
    Armor: {

        // Tier 0

        Plastic_Helmet: {
            name: "Plastic Helmet",
            description: "A flimsy plastic helmet offering minimal protection but great comfort.",
            image: "../Graphics/Items/Armor/Plastic_Helmet.png",
            stats: {
                
            }
        },

        Plastic_Chestplate: {
            name: "Plastic Chestplate",
            description: "Light plastic plates taped together. Barely protective, but easy to wear.",
            image: "../Graphics/Items/Armor/Plastic_Chestplate.png",
            stats: {
                
            }
        },

        Plastic_Greaves: {
            name: "Plastic Greaves",
            description: "Plastic leg guards that restrict movement very little.",
            image: "../Graphics/Items/Armor/Plastic_Greaves.png",
            stats: {
                
            }
        },

        Plastic_Boots: {
            name: "Plastic Boots",
            description: "Flexible plastic boots that are surprisingly comfortable.",
            image: "../Graphics/Items/Armor/Plastic_Boots.png",
            stats: {
                
            }
        },

        // TIER 1 

        Board_Helmet: {
            name: "Board Helmet",
            description: "A crude helmet made of reinforced wooden boards.",
            image: "../Graphics/Items/Armor/Board_Helmet.png",
            stats: {
                
            }
        },

        Board_Chestplate: {
            name: "Board Chestplate",
            description: "A rough chestplate built from layered wooden planks.",
            image: "../Graphics/Items/Armor/Board_Chestplate.png",
            stats: {
                
            }
        },

        Board_Greaves: {
            name: "Board Greaves",
            description: "Wooden leg protection offering minimal coverage.",
            image: "../Graphics/Items/Armor/Board_Greaves.png",
            stats: {
                
            }
        },

        Board_Boots: {
            name: "Board Boots",
            description: "Heavy wooden boots that slightly slow movement.",
            image: "../Graphics/Items/Armor/Board_Boots.png",
            stats: {
                
            }
        }
    },


    Cubes: {

        image: "../Graphics/Items/Armor/Blank_Cube.png"
    },

    Materials: {

    }
}

// ============================================================================
// INVENTORY
// ============================================================================

let Backpack = {
    // Inventory
    x: centerX * 0.75,
    y: 50,
    width: 600,
    height: 600,
    
    // slots
    SlotX: 8,
    SlotY: 8,
    SlotSize: 50,
    RollY: 0,
    SlotDistance: 8,
    get GridPos() {
        const gridWidth =
            this.SlotX * this.SlotSize +
            (this.SlotX - 1) * this.SlotDistance;

        const gridHeight =
            this.SlotY * this.SlotSize +
            (this.SlotY - 1) * this.SlotDistance;

        return {
            x: (this.width - gridWidth) / 2,
            y: (this.height - gridHeight) / 2
        }
    },
    // items
    Inventory: []
}

// ============================================================================
// SCROLL
// ============================================================================

function ScrollInventory(Amount) {
    Backpack.RollY += Amount
}

function ScrollImages(Amount) {
    Devbook.scroll += Amount
}

function ScrollChat(Amount) {
    Chat.scroll += Amount
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

function SummonDevPanel() {
    ctx.drawImage(images.Body, Devbook.x, Devbook.y, Devbook.size, Devbook.size);

    const startX = Devbook.selector.x;
    const startY = Devbook.selector.y;

    for (let i = 0; i < Devbook.tabs.length; i++) {
        const tab = Devbook.tabs[i];
        const tabY = startY + i * (Devbook.tabSize.h * 1.1);

        ctx.drawImage(
            images[tab.id],
            startX,
            tabY,
            Devbook.tabSize.w,
            Devbook.tabSize.h
        );
    }
}

// ============================================================================
// DRAW
// ============================================================================

function drawGameTexts() {
  for (const t of gameTexts) {
    drawText(ctx, t.font, t.text, t.x, t.y, t.scale);
  }
}

function Draw() {
    CreateBackground()
    Healthbar()
    ManaBar()
    XpBar()
    drawGameTexts();
    
    /*
    if (opened. === true) {
        ()
    }
    */
    if (opened.Backpack === true) {
        OpenBackpack()
    }
    if (opened.Devbook === true) {
        SummonDevPanel()
    }
    if (opened.Hitboxes === true) {
        ShowHitboxes()
    }
    if (opened.Chat === true) {
        ActivateChat()
    }

    drawText(ctx, "Player", "HELLO WORLD", 50, 50, 2);
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

loadImages(images)
  .then(loaded => {
    images = loaded;
    return loadFonts();
  })
  .then(() => {
    Game();
  })
  .catch(err => {
    console.error(err);
  });