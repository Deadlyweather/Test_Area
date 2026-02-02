// ============================================================================
// CANVAS & GRAPHICS
// ============================================================================
const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const graphics = {
    background: {
        color: "black",
        width: canvas.width,
        height: canvas.height,
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
};

// ============================================================================
// IMAGES
// ============================================================================

const imageAssets = {
    bars: {
        Health: "./Graphics/UI/Health_Bar.png",
        Mana: "./Graphics/UI/Mana_Bar.png",
        Xp: "./Graphics/UI/Xp_Bar.png"
    },
    inventory: {
        Inventory: "./Graphics/UI/Inventory.png",
        Slot: "./Graphics/UI/Slot.png"
    },
    armor: {
        Empty: "./Graphics/UI/Equipment.png",
        Equipped: "./Graphics/UI/Equipped.png",
        Empty_Head: "./Graphics/Items/Armor/Empty_Head.png",
        Empty_Chest: "./Graphics/Items/Armor/Empty_Chest.png",
        Empty_Legs: "./Graphics/Items/Armor/Empty_Legs.png",
        Empty_Feet: "./Graphics/Items/Armor/Empty_Feet.png",
        Board_Boots: "./Graphics/Items/Armor/Board_Boots.png",
        Board_Chestplate: "./Graphics/Items/Armor/Board_Chestplate.png",
        Board_Greaves: "./Graphics/Items/Armor/Board_Greaves.png",
        Board_Helmet: "./Graphics/Items/Armor/Board_Helmet.png",
        Plastic_Boots: "./Graphics/Items/Armor/Plastic_Boots.png",
        Plastic_Chestplate: "./Graphics/Items/Armor/Plastic_Chestplate.png",
        Plastic_Greaves: "./Graphics/Items/Armor/Plastic_Greaves.png",
        Plastic_Helmet: "./Graphics/Items/Armor/Plastic_Helmet.png"
    },
    devbook: {
        Body: "./Graphics/UI/Devbook/Body.png",
        Close: "./Graphics/UI/Devbook/Close.png",
        Back: "./Graphics/UI/Devbook/Back.png",
        Art: "./Graphics/UI/Devbook/Art.png",
        Armor: "./Graphics/UI/Devbook/Armor.png",
        Items: "./Graphics/UI/Devbook/Items.png",
        Stats: "./Graphics/UI/Devbook/Combat.png",
        Item: "./Graphics/UI/Devbook/Item_logs.png",
        Consumeable: "./Graphics/UI/Devbook/Consumeable.png",
        Materials: "./Graphics/UI/Devbook/Materials.png",
        Equipment: "./Graphics/UI/Devbook/Equipment.png",
        Stat: "./Graphics/UI/Devbook/Stat_sheet.png",
        Attributes: "./Graphics/UI/Devbook/Attributes.png",
        Combat: "./Graphics/UI/Devbook/Combat.png",
        Movement: "./Graphics/UI/Devbook/Movement.png",
        Home: "./Graphics/UI/Devbook/Body.png",
        List: "./Graphics/UI/Devbook/Item_logs.png"
    },
    cubes: {
        Blank_Cube: "./Graphics/Items/Cubes/Blank_Cube.png",

        Health_Cube: "./Graphics/Items/Cubes/Health_Cube.png",

        Heal_Cube: "./Graphics/Items/Cubes/Heal_Cube.png",
        Mana_Cube: "./Graphics/Items/Cubes/Mana_Cube.png",
        Shield_Cube: "./Graphics/Items/Cubes/Shield_Cube.png",


        Brawn_Cube: "./Graphics/Items/Cubes/Brawn_Cube.png",
        Haste_Cube: "./Graphics/Items/Cubes/Haste_Cube.png",
        Vital_Cube: "./Graphics/Items/Cubes/Vital_Cube.png",
        Wise_Cube: "./Graphics/Items/Cubes/Wise_Cube.png",
        
        Mighty_Cube: "./Graphics/Items/Cubes/Mighty_Cube.png",
        Tough_Cube: "./Graphics/Items/Cubes/Tough_Cube.png"
        
    },
    materials: {
        Ascended_Soul: "./Graphics/Items/Materials/Ascended_Soul.png",
        Blue_Steel: "./Graphics/Items/Materials/Blue_Steel.png",
        Corrupted_Soul: "./Graphics/Items/Materials/Corrupted_Soul.png",
        Crystal: "./Graphics/Items/Materials/Crystal.png",
        Iron: "./Graphics/Items/Materials/Iron.png",
        Mighty_Soul: "./Graphics/Items/Materials/Mighty_Soul.png",
        Mythril: "./Graphics/Items/Materials/Mythril.png",
        Plastic: "./Graphics/Items/Materials/Plastic.png",
        Rock: "./Graphics/Items/Materials/Rock.png",
        Soul: "./Graphics/Items/Materials/Soul.png",
        Steel: "./Graphics/Items/Materials/Steel.png",
        Void_Iron: "./Graphics/Items/Materials/Void_Iron.png",
        Void_wood: "./Graphics/Items/Materials/Void_wood.png"
    }
};

// Flatten for loading
let images = {};
function flattenImageAssets() {
    Object.values(imageAssets).forEach(category => {
        Object.assign(images, category);
    });
}

// ============================================================================
// IMAGE -> TEXT RENDER HELPERS
// ============================================================================

const ImageText = {
    // Voit vaihtaa tämän tyyliin: " .:-=+*#%@"
    // Mitä pidempi, sitä enemmän sävyjä
    defaultRamp: " .,:;ox%#@",

    // Laskee kirkkauden (0..255)
    luminance(r, g, b) {
        // parempi kuin (r+g+b)/3
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    // Valitse merkki kirkkauden mukaan
    charFromBrightness(brightness, ramp) {
        const t = brightness / 255;
        const idx = Math.floor(t * (ramp.length - 1));
        return ramp[idx];
    },

    draw(img, x, y, settings = {}) {
        if (!img) return;

        const {
            scale = 1,
            spacing = 2,
            ramp = this.defaultRamp,     // jos haluat automaattiset merkit
            fixedChar = null,            // jos haluat aina saman merkin esim "@"
            alphaThreshold = 0.1,        // 0..1
            fontName = "Player",         // mikä fontti käytetään
            colorize = true,             // true = käyttää kuvan värejä
            maxWidth = null              // voit rajoittaa leveyttä (px)
        } = settings;

        // Tee offscreen canvas ja piirrä kuva siihen
        const offscreen = document.createElement("canvas");

        let w = img.width;
        let h = img.height;

        // Halutessa skaalataan kuva pienemmäksi ennen tekstitystä
        if (maxWidth && w > maxWidth) {
            const ratio = maxWidth / w;
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
        }

        offscreen.width = w;
        offscreen.height = h;

        const offctx = offscreen.getContext("2d");
        offctx.drawImage(img, 0, 0, w, h);

        const data = offctx.getImageData(0, 0, w, h).data;

        // Piirrä tekstinä
        for (let yy = 0; yy < h; yy += spacing) {
            for (let xx = 0; xx < w; xx += spacing) {
                const index = (yy * w + xx) * 4;
                const r = data[index + 0];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3] / 255;

                if (a <= alphaThreshold) continue;

                let ch;
                if (fixedChar) {
                    ch = fixedChar;
                } else {
                    const bright = this.luminance(r, g, b);
                    ch = this.charFromBrightness(bright, ramp);
                }

                // Tyhjät merkit skip (jos ramp alkaa välilyönnillä)
                if (ch === " ") continue;

                ctx.save();
                if (colorize) {
                    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                } else {
                    ctx.fillStyle = `rgba(255,255,255,${a})`;
                }

                // Käytetään sun omaa bitmap-fonttia
                FontManager.drawText(ctx, fontName, ch, x + xx * scale, y + yy * scale, scale);

                ctx.restore();
            }
        }
    }
};

// ============================================================================
// IMAGE LOADER
// ============================================================================

const ImageLoader = {
    loadImages(imageList) {
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
            results.forEach(result => loadedImages[result.key] = result.img);
            return loadedImages;
        });
    }
};

// ============================================================================
// FONTS
// ============================================================================

const FontManager = {
    fonts: {
        Player: { src: "./Graphics/Fonts/Orange_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
        Enemy: { src: "./Graphics/Fonts/Red_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
        Info: { src: "./Graphics/Fonts/Info_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
        Deadlyweather: { src: "./Graphics/Fonts/Deadlyweather_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 16 }
    },

    loadFont(fontName) {
        return new Promise(resolve => {
            const img = new Image();
            img.src = this.fonts[fontName].src;
            img.onload = () => { this.fonts[fontName].image = img; resolve(); };
            img.onerror = () => { console.warn("Font failed to load: " + this.fonts[fontName].src); resolve(); };
        });
    },

    loadAll() {
        return Promise.all(Object.keys(this.fonts).map(name => this.loadFont(name)));
    },

    textImageSettings: {
        scale: 1,
        spacing: 1,
        textchar: "¤"
    },
    

    drawText(ctx, fontName, text, x, y, scale = 1) {
        const font = this.fonts[fontName];
        if (!font || !font.image) {
            ctx.save(); 
            ctx.fillStyle = "red"; 
            ctx.font = `${16*scale}px Arial`; 
            ctx.fillText(text, x, y + 16*scale); 
            ctx.restore(); 
            return;
        }
        const size = font.size;
        const lines = text.split("\n");
        const universalCharX = font.image.width - size;
        for (let l = 0; l < lines.length; l++) {
            let line = lines[l].toUpperCase();
            for (let i = 0; i < line.length; i++) {
                let idx = font.chars.indexOf(line[i]);
                let drawX = (idx === -1) ? universalCharX : idx * size;
                ctx.drawImage(font.image, drawX, 0, size, size, x + i*size*scale, y + l*size*scale, size*scale, size*scale);
            }
        }
    },

    drawImageText(img, x, y, Settings = {}) {
        const scale = Settings.scale || this.textImageSettings.scale;
        const spacing = Settings.spacing || this.textImageSettings.spacing;
        const textchar = Settings.textchar || this.textImageSettings.textchar;

        const offscreen = document.createElement("canvas");
        offscreen.width = img.width * scale;
        offscreen.height = img.height * scale;
        const offctx = offscreen.getContext("2d");
        offctx.drawImage(img, 0, 0);

        const data = offctx.getImageData(0, 0, img.width, img.height);

        for (let yPos = 0; yPos < data.height; yPos++) {
            for (let xPos = 0; xPos < data.width; xPos += spacing) {
                const index = (yPos * data.width + xPos) * 4;
                const alpha = data[index + 3] / 255
                if (alpha > 0) {
                    const r = data[index], g = data[index + 1], b = data[index + 2];
                    ctx.save();
                    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                    drawText(ctx, "Player", textchar, x + xPos * scale, y + yPos * scale, scale);
                    ctx.restore();
                }
            }
        }
    }
};

function drawRichText(ctx, fontName, text, x, y, scale = 1) {
    const font = FontManager.fonts[fontName];
    const size = font?.size || 8;

    if (!font || !font.image) {
        ctx.save();
        ctx.fillStyle = "red";
        ctx.font = `${16 * scale}px Arial`;
        ctx.fillText(text, x, y + 16 * scale);
        ctx.restore();
        return;
    }

    const lines = text.split("\n");

    for (let l = 0; l < lines.length; l++) {
        const line = lines[l];
        let cursorX = x;
        let cursorY = y + l * size * scale;

        const parts = line.split(/(\{[^}]+\})/g);

        for (let part of parts) {
            if (part.startsWith("{") && part.endsWith("}")) {
                const inside = part.slice(1, -1).trim();
                const [rawName, rawScale] = inside.split(",").map(s => s.trim());

                const iconName = rawName;
                const iconScale = rawScale ? parseFloat(rawScale) : 1;

                const img = images[iconName];

                if (img) {
                    const iconSize = size * scale * iconScale;

                    ctx.drawImage(img, cursorX, cursorY, iconSize, iconSize);

                    cursorX += iconSize;
                } else {
                    FontManager.drawText(ctx, fontName, part, cursorX, cursorY, scale);
                    cursorX += part.length * size * scale;
                }

                continue;
            }

            // normaali teksti
            const normal = part.toUpperCase();
            FontManager.drawText(ctx, fontName, normal, cursorX, cursorY, scale);

            cursorX += normal.length * size * scale;
        }
    }
}

function getLineHeightWithIcons(fontName, line, baseLineHeight, scale = 1) {
    const font = FontManager.fonts[fontName];
    const size = (font?.size || 8) * scale;

    const matches = [...line.matchAll(/\{([^}]+)\}/g)];
    if (matches.length === 0) return baseLineHeight;

    let maxIconScale = 1;

    for (const m of matches) {
        const inside = m[1].trim();
        const parts = inside.split(",").map(s => s.trim());
        const iconScale = parts[1] ? parseFloat(parts[1]) : 1;

        if (!isNaN(iconScale)) {
            maxIconScale = Math.max(maxIconScale, iconScale);
        }
    }

    const iconHeight = size * maxIconScale;

    return Math.max(baseLineHeight, iconHeight + 4);
}

function parseRichParts(line) {
    // Palauttaa arrayn jossa on joko {type:"text", value:"..."} tai {type:"icon", name:"...", scale:1}
    const parts = line.split(/(\{[^}]+\})/g).filter(Boolean);

    return parts.map(p => {
        if (p.startsWith("{") && p.endsWith("}")) {
            const inside = p.slice(1, -1).trim();
            const [rawName, rawScale] = inside.split(",").map(s => s.trim());

            return {
                type: "icon",
                name: rawName,
                scale: rawScale ? parseFloat(rawScale) : 1
            };
        }

        return { type: "text", value: p };
    });
}

function measureRichLine(fontName, line, scale = 1) {
    const font = FontManager.fonts[fontName];
    const size = (font?.size || 8) * scale;

    let width = 0;
    let maxHeight = size;

    const parts = parseRichParts(line);

    for (const part of parts) {
        if (part.type === "text") {
            // bitmap-fontissa jokainen merkki = size leveä
            width += part.value.length * size;
            maxHeight = Math.max(maxHeight, size);
        } else if (part.type === "icon") {
            const iconScale = isNaN(part.scale) ? 1 : part.scale;
            const iconSize = size * iconScale;

            width += iconSize;
            maxHeight = Math.max(maxHeight, iconSize);
        }
    }

    return { width, height: maxHeight, baseCharSize: size };
}



// Alias for compatibility
const drawText = (ctx, fontName, text, x, y, scale = 1) => FontManager.drawText(ctx, fontName, text, x, y, scale);

// ============================================================================
// TIME & CAMERA
// ============================================================================

const gameState = {
    timeScale: 1,
    time: 0
};

const camera = {
    position: { x: 0, y: 0 },
    screen: { x: canvas.width / 2, y: canvas.height / 2 },
    offset: { x: 0, y: 0 },
    maxOffset: 500
};

// ============================================================================
// PLAYER
// ============================================================================

const player = {
    position: { x: 0, y: 0 },
    appearance: { size: 20 },
    health: { max: 10, current: 10 },
    shield: 0,
    mana: { max: 1, current: 1 },
    level: 0,
    experience: 100,
    LevelReq: 100,
    stats: {
        strength: 1,
        agility: 1,
        intelligence: 1,
        vitality: 0
    },
    points: 0
};

// Backward compatibility aliases
const Player = player;

// ============================================================================
// INPUT & KEYBINDS
// ============================================================================

const inputManager = {
    keys: {},
    keybinds: {
        settings: "o",
        moveNorth: "w",
        moveWest: "a",
        moveSouth: "s",
        moveEast: "d",
        ranged: "Mouse1",
        rangedUltimate: "Ctrl",
        melee: "Mouse2",
        meleeUltimate: "Space",
        dash: "Shift",
        backpack: "§",
        hotbarKeys: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "0" },
        interact: "e",
        skills: "l",
        confirm: "Enter",
        devbook: "p",
        hitbox: "i",
        chat: "t"
    }
};

// Backward compatibility
const Keys = inputManager.keys;
const Keybinds = inputManager.keybinds;

// ============================================================================
// UI STATE
// ============================================================================

const uiState = {
    settings: false,
    backpack: false,
    devbook: false,
    hitboxes: false,
    chat: false
};

// Backward compatibility
const opened = uiState;

// ============================================================================
// DEVBOOK
// ============================================================================

const devbook = {
    x: 300,
    y: 50,
    size: 600,

    tabSize: { w: 128, h: 64 },
    tabGap: 25,

    scroll: 0,
    scrollSpeed: 50,

    activeTab: "Main",
    activeSubTab: null,

    headerHeight: 80,
    padding: 20,

    lineHeight: 18,
    
    get selectorX() { return this.x * 3 + this.tabGap ; },
    get selectorY() { return this.y; },
    
    

    get headerArea() {
        return {
            x: this.x * 1.6 + this.padding,
            y: this.y * 1.6 + this.padding,
            width: this.size - (this.padding * 2),
            height: this.headerHeight
        }
    },

    get contentArea() {
        return {
            x: this.x * 1.1 + this.padding ,
            y: this.y + this.padding + this.headerHeight,
            w: this.size - this.padding * 2,
            h: (this.size - (this.padding * 2 + this.headerHeight)) * 0.925
        };
    },

    get subTabArea() {
        return {
            x: this.x + this.padding + 10,
            y: this.y + this.padding + this.headerHeight - 35,
            w: this.size - this.padding * 2,
            h: 30
        };
    },

    tabs: [
        { id: "Art", title: "Art" },
        { id: "Item", title: "Items" },
        { id: "Stat", title: "Stats" },
    ],

    subTabs: {
        Art: [
            { id: "Back", title: "Back" }
        ],

        Item: [
            { id: "Consumeable", title: "Consumeables" },
            { id: "Materials", title: "Materials" },
            { id: "Equipment", title: "Equipment" },
            { id: "Back", title: "Back" }
        ],

        Stat: [
            { id: "Attributes", title: "Attributes" },
            { id: "Combat", title: "Combat" },
            { id: "Movement", title: "Movement" },
            { id: "Back", title: "Back" }
        ]
    },

    content: {
        Main: [
            "DEVBOOK",
            "Allow me to introduce my world",
            "and you might survive this endeavor.",
        ],

        Art: [
            "====================",
            "BLANK CUBE",
            "{Blank_Cube, 15}",
            "Base of every cube",

            "====================",
            "HEALTH CUBE",
            "{Health_Cube, 15}",
            "Cube corrupted by malicious magic",
            "I made it evil because i wanted to encourage risky playstyle.",

            "====================",
            "HEAL CUBE",
            "{Heal_Cube, 15}",
            "Cube infused with souls.",
            "I created this to be a multipurpose item.",

            "====================",
            "MANA CUBE",
            "{Mana_Cube, 15}",
            "Cube infused with souls and your energy",
            "Its purpose is to be a backup item.",

            "====================",
            "SHIELD CUBE",
            "{Shield_Cube, 15}",
            "Cube transformed into new form",
            "Purpose is similiar to Mana Cube, but for defense",

            "====================",
            "MIGHTY CUBE",
            "{Mighty_Cube, 15}",
            "Combination of 4 different types of main cubes.",
            "This is a reward for players that save up",
            "and take the risk of dying.",

            "====================",
            "BRAWN CUBE",
            "{Brawn_Cube, 15}",
            "Cube infused with powerful souls.",
            "item that likely will be a difficult one to balance.",

            "====================",
            "HASTE CUBE",
            "{Haste_Cube, 15}",
            "Cube infused with powerful souls.",
            "I have to figure out how to make users",
            "less likely to exploit this item.",

            "====================",
            "VITAL CUBE",
            "{Vital_Cube, 15}",
            "Cube infused with powerful souls.",
            "Probably the core of tank builds and chase for immortality.",

            "====================",
            "WISE CUBE",
            "{Wise_Cube, 15}",
            "Cube infused with powerful souls.",
            "Even more difficult to balance than Brawn Cube.",

            "====================",
            "TOUGH CUBE",
            "{Tough_Cube, 15}",
            "Combination of 4 different types of attribute cubes.",
            "This is a reward for players that save up",
            "and take the risk of falling behind in progression.",

            "====================",
            "PLASTIC HELMET",
            "{Plastic_Helmet, 15}",
            "Sort of comfortable headgear.",
            "I wanted to start the armor with no losses",
            "so players will have an easy start.",

            "====================",
            "PLASTIC CHESTPLATE",
            "{Plastic_Chestplate, 15}",
            "Sort of comfortable chestplate.",
            "I also wanted armor to be less powerful",
            "so players would not feel forced to wear it.",

            "====================",
            "PLASTIC GREAVES",
            "{Plastic_Greaves, 15}",
            "Sort of comfortable greaves.",
            "Then i chose to make them also cheaper",
            "to encourage players to wear them first.",

            "====================",
            "PLASTIC BOOTS",
            "{Plastic_Boots, 15}",
            "Sort of comfortable boots.",
            "Armor ofcourse is a powerful stat to have",
            "so just having low number of it isn't bad either.",

            "====================",
            "BOARD HELMET",
            "{Board_Helmet, 15}",
            "Skull breaker.",
            "Felt like making a wooden armor would be a funny idea.",

            "====================",
            "BOARD CHESTPLATE",
            "{Board_Chestplate, 15}",
            "Bane of your torso.",
            "But this has purpose of being also incredibly powerful",
            "for defence to encourage standing and fighting.",

            "====================",
            "BOARD GREAVES",
            "{Board_Greaves, 15}",
            "Violator of legs.",
            "The idea behind armor is to make players forfeit their mobility",
            "to focus on fighting.",

            "====================",
            "BOARD BOOTS",
            "{Board_Boots, 15}",
            "Heel Harbinger.",
            "I also made wooden armor to be very expensive",
            "to make sure players only get it when they are ready.",

            "====================",
            "VOID WOOD",
            "{Void_wood, 15}",
            "I decided to grow a garden in void. .-.",

            "====================",
            "PLASTIC",
            "{Plastic, 15}",
            "I also decided to throw trash in the void to mix things up.",

            "====================",
            "ROCK",
            "{Rock, 15}",
            "Literal meteorite from space named rock",

            "====================",
            "CRYSTAL",
            "{Crystal, 15}",
            "Its a crystal, what more is there to say?",

            "====================",
            "IRON",
            "{Iron, 15}",
            "Iron exists in void because i say so.",

            "====================",
            "STEEL",
            "{Steel, 15}",
            "Just better iron.",

            "====================",
            "BLUE STEEL",
            "{Blue_Steel, 15}",
            "Steel infused with smurfs. Take that papa smurf!",

            "====================",
            "MYTHRIL",
            "{Mythril, 15}",
            "I also added mythril just because its cool.",

            "====================",
            "VOID IRON",
            "{Void_Iron, 15}",
            "I also made a better version of iron that already exists in void",

            "====================",
            "SOUL",
            "{Soul, 15}",
            "Theres some souls you have to steal for survival.",

            "====================",
            "ASCENDED SOUL",
            "{Ascended_Soul, 15}",
            "For some reason souls can ascend in void back into void",

            "====================",
            "MIGHTY SOUL",
            "{Mighty_Soul, 15}",
            "Souls that for some reason i chose they can be mighty",
            "Truth is its just a title",
            "Pretend it makes sense",

            "====================",
            "CORRUPTED SOUL",
            "{Corrupted_Soul, 15}",
            "Exists because some just cant handle the smoke",
            "and some random magic thingies i made up"
        ],

        Item: {
            Consumeable: [
                "Consumeables:",
            ],
            Materials: [
                "Materials:",
            ],
            Equipment: [
                "Equipment:",
            ]
        },

        Stat: {
            Attributes: [
                "Attributes:",
            ],
            Combat: [
                "Combat Stats:",
            ],
            Movement: [
                "Movement Stats:",
            ]
        }
    }
};


function getDevbookLines() {
    const tab = devbook.activeTab;

    // MAIN
    if (tab === "Main") {
        const lines = devbook.content.Main;
        if (!lines || !Array.isArray(lines)) return ["EMPTY PAGE"];
        return lines;
    }

    const tabObj = devbook.content[tab];
    if (!tabObj) return ["EMPTY TAB"];

    if (Array.isArray(tabObj)) {
        return tabObj;
    }

    const sub = devbook.activeSubTab;
    const lines = tabObj[sub];

    if (!lines) return ["EMPTY PAGE"];
    return lines;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function getDevbookScrollBounds() {
    const area = devbook.contentArea;
    const lines = getDevbookLines();

    let contentHeight = 0;

    for (let i = 0; i < lines.length; i++) {
        contentHeight += getLineHeightWithIcons("Player", lines[i], devbook.lineHeight, 1);
    }

    if (contentHeight <= area.h) {
        return { min: 0, max: 0 };
    }

    const minScroll = -(contentHeight - area.h);
    const maxScroll = 0;

    return { min: minScroll, max: maxScroll };
}

function clampDevbookScroll() {
    const bounds = getDevbookScrollBounds();
    devbook.scroll = clamp(devbook.scroll, bounds.min, bounds.max);
}

// Backward compatibility
const Devbook = devbook;
const DevbookContent = devbook.content;

// ============================================================================
// DEVBOOK RENDERER
// ============================================================================

const DevbookRenderer = {
    render() {
        if (!devbook || !images.Body) return;

        ctx.drawImage(images.Body, devbook.x, devbook.y, devbook.size, devbook.size);

        this.renderMainTabsRight();
        this.renderHeaderFixed();
        this.renderSubTabs();
        this.renderScrollableContent();
    },

    renderMainTabsRight() {
        // If we have an active subtab that's not on Main, show the subtabs instead
        const subTabList = devbook.subTabs[devbook.activeTab] || [];
        const hasSubTabs = subTabList.length > 0 && devbook.activeTab !== "Main";

        if (hasSubTabs) {
            // Render subtabs in place of main tabs
            for (let i = 0; i < subTabList.length; i++) {
                const st = subTabList[i];

                const x = devbook.selectorX;
                const y = devbook.selectorY + i * (devbook.tabSize.h + devbook.tabGap);

                // Draw subtab image if available; otherwise draw a neutral rectangle.
                if (images[st.id]) {
                    ctx.drawImage(images[st.id], x, y, devbook.tabSize.w, devbook.tabSize.h);
                } else {
                    ctx.fillStyle = "rgba(100,100,100,0.5)";
                    ctx.fillRect(x, y, devbook.tabSize.w, devbook.tabSize.h);
                }

                // Add highlight overlay for active subtab
                if (devbook.activeSubTab === st.id) {
                    ctx.save();
                    ctx.fillStyle = "rgba(255,255,255,0.3)";
                    ctx.fillRect(x, y, devbook.tabSize.w, devbook.tabSize.h);
                    ctx.restore();
                }
            }
        } else {
            // Render main tabs normally
            for (let i = 0; i < devbook.tabs.length; i++) {
                const tab = devbook.tabs[i];

                const x = devbook.selectorX;
                const y = devbook.selectorY + i * (devbook.tabSize.h + devbook.tabGap);

                // Do not draw an image for the Main tab even if one exists.
                if (tab.id !== "Main" && images[tab.id]) {
                    ctx.drawImage(images[tab.id], x, y, devbook.tabSize.w, devbook.tabSize.h);
                } else {
                    // Draw a neutral rectangle for Main or missing images; do not overlay text.
                    ctx.fillStyle = "rgba(120,120,120,0.25)";
                    ctx.fillRect(x, y, devbook.tabSize.w, devbook.tabSize.h);
                }
            }
        }
    },

    renderHeaderFixed() {
        const h = devbook.headerArea;

        drawText(ctx, "Info", "Devbook", h.x, h.y, 3);
    },

    renderSubTabs() {
        // Subtabs are now rendered in renderMainTabsRight() to replace main tabs
        // This function is kept for compatibility but does nothing
    },

    renderScrollableContent() {
        const area = devbook.contentArea;
        const lines = getDevbookLines();

        ctx.save();
        ctx.beginPath();
        ctx.rect(area.x, area.y, area.w, area.h);
        ctx.clip();

        let cursorY = area.y + devbook.scroll;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            drawRichText(ctx, "Player", line, area.x, cursorY, 1);

            const lineH = getLineHeightWithIcons("Player", line, devbook.lineHeight, 1);
            cursorY += lineH;
        }

        ctx.restore();
    }
}



// ============================================================================
// HITBOX SYSTEM
// ============================================================================

const hitboxSystem = {
    hitboxes: [],
    
    createDevbookHitboxes() {
        this.hitboxes = [];

        // MAIN TAB HITBOXIT (oikealla)
        // Only create main tab hitboxes when we're on Main. When inside another tab,
        // subtabs should be the only clickable items so Back is the only way back.
        if (devbook.activeTab === "Main") {
            for (let i = 0; i < devbook.tabs.length; i++) {
                const tab = devbook.tabs[i];

                const x = devbook.selectorX;
                const y = devbook.selectorY + i * (devbook.tabSize.h + devbook.tabGap);

                this.hitboxes.push({
                    id: "tab_" + tab.id,
                    x, y,
                    width: devbook.tabSize.w,
                    height: devbook.tabSize.h,
                    tags: ["UI"],
                    trigger: () => {
                        devbook.activeTab = tab.id;

                        // reset subtab to first if there are any, otherwise null
                        const subList = devbook.subTabs[tab.id] || [];
                        devbook.activeSubTab = subList.length > 0 ? subList[0].id : null;

                        devbook.scroll = 0;
                        this.createDevbookHitboxes(); // rebuild
                    }
                });
            }
        }

        // SUBTAB HITBOXIT (devbookin sisällä)
        this.createDevbookSubTabHitboxes();
    },

    createDevbookSubTabHitboxes() {
        // Do not create subtabs when on Main: main tabs are handling clicks there.
        if (devbook.activeTab === "Main") return;

        const list = devbook.subTabs[devbook.activeTab] || [];
        if (list.length === 0) return;

        for (let i = 0; i < list.length; i++) {
            const st = list[i];

            // Render in same position as main tabs (left side)
            const x = devbook.selectorX;
            const y = devbook.selectorY + i * (devbook.tabSize.h + devbook.tabGap);
            const w = devbook.tabSize.w;
            const h = devbook.tabSize.h;

            this.hitboxes.push({
                id: "subtab_" + st.id,
                x: x,
                y: y,
                width: w,
                height: h,
                tags: ["UI"],
                trigger: () => {
                    if (st.id === "Back") {
                        devbook.activeTab = "Main";
                        devbook.activeSubTab = null;
                        devbook.scroll = 0;
                        this.createDevbookHitboxes();
                        return;
                    }

                    devbook.activeSubTab = st.id;
                    devbook.scroll = 0;
                }
            });
        }
    },

    isPointInHitbox(x, y, hitbox) {
        return x >= hitbox.x && x <= hitbox.x + hitbox.width &&
               y >= hitbox.y && y <= hitbox.y + hitbox.height;
    },
    
    checkClick(x, y) {
        for (let hb of this.hitboxes) {
            if (!hb.tags.includes("UI")) continue;
            if (this.isPointInHitbox(x, y, hb)) {
                if (hb.trigger) hb.trigger();
            }
        }
    },
    
    draw() {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        for (let hitbox of this.hitboxes) {
            if (hitbox.tags.includes("UI") && uiState.devbook) {
                ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
            }
        }

        ctx.restore();
    }
};

// Backward compatibility
let Hitbox = {
    get Hitboxes() { return hitboxSystem.hitboxes; }
};
function CreateDevbookHitboxes() { hitboxSystem.createDevbookHitboxes(); }
function ShowHitboxes() { hitboxSystem.draw(); }

// ============================================================================
// EVENT LISTENERS
// ============================================================================

const EventManager = {
    init() {
        document.addEventListener("keydown", (e) => this.handleKeyDown(e));
        canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
        document.addEventListener("wheel", (e) => this.handleScroll(e));
    },

    handleKeyDown(e) {
        if (e.key === inputManager.keybinds.backpack) uiState.backpack = !uiState.backpack;
        if (e.key === inputManager.keybinds.devbook) {
            uiState.devbook = !uiState.devbook;
            if (uiState.devbook) hitboxSystem.createDevbookHitboxes();
        }
        if (e.key === inputManager.keybinds.hitbox) uiState.hitboxes = !uiState.hitboxes;
        if (e.key === inputManager.keybinds.chat) uiState.chat = !uiState.chat;
    },

    handleCanvasClick(e) {
        hitboxSystem.checkClick(e.clientX, e.clientY);
    },

    handleScroll(e) {
        if (uiState.devbook) {
            devbook.scroll -= Math.sign(e.deltaY) * devbook.scrollSpeed;
            clampDevbookScroll();
            return;
        }

        if (uiState.backpack) {
            ScrollInventory(e.deltaY);
            return;
        }
    }
}

// ============================================================================
// SCROLL FUNCTIONS
// ============================================================================

const ScrollManager = {
    scrollInventory(amount) { backpackUI.scroll += amount; },
    scrollDevbook(amount) { devbook.scroll += amount; },
    scrollChat(amount) { chatUI.scroll += amount; }
};

// Backward compatibility
function ScrollInventory(Amount) { ScrollManager.scrollInventory(Amount); }
function ScrollImages(Amount) { ScrollManager.scrollDevbook(Amount); }
function ScrollChat(Amount) { ScrollManager.scrollChat(Amount); }

// ============================================================================
// BACKPACK & UI SYSTEMS
// ============================================================================

const backpackUI = {
    x: canvas.width / 2 * 0.75,
    y: 50,
    width: 600,
    height: 600,
    slotX: 8,
    slotY: 8,
    slotSize: 50,
    scroll: 0,
    slotDistance: 8,
    inventory: [],

    get gridPos() {
        const gw = this.slotX * this.slotSize + (this.slotX - 1) * this.slotDistance;
        const gh = this.slotY * this.slotSize + (this.slotY - 1) * this.slotDistance;
        return { x: (this.width - gw) / 2, y: (this.height - gh) / 2 };
    },

    render() {
        ctx.drawImage(images.Inventory, this.x, this.y, this.width, this.height);
        this.renderSlots();
    },

    renderSlots() {
        for (let plotY = 0; plotY < this.slotY; plotY++) {
            for (let plotX = 0; plotX < this.slotX; plotX++) {
                const slotX = this.x + this.gridPos.x + plotX * (this.slotSize + this.slotDistance);
                const slotY = this.y + this.gridPos.y + plotY * (this.slotSize + this.slotDistance) + this.scroll;
                ctx.drawImage(images.Slot, slotX, slotY, this.slotSize, this.slotSize);
            }
        }
    }
};

// Backward compatibility
let Backpack = {
    get x() { return backpackUI.x; },
    get y() { return backpackUI.y; },
    get width() { return backpackUI.width; },
    get height() { return backpackUI.height; },
    get SlotX() { return backpackUI.slotX; },
    get SlotY() { return backpackUI.slotY; },
    get SlotSize() { return backpackUI.slotSize; },
    get RollY() { return backpackUI.scroll; },
    set RollY(val) { backpackUI.scroll = val; },
    get SlotDistance() { return backpackUI.slotDistance; },
    get GridPos() { return backpackUI.gridPos; },
    get Inventory() { return backpackUI.inventory; }
};
function OpenBackpack() { backpackUI.render(); }
function Slots() { backpackUI.renderSlots(); }

// ============================================================================
// UI BARS (Health, Mana, XP)
// ============================================================================

const barUI = {
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,

    health: {
        x: () => barUI.centerX * 0.65,
        y: () => barUI.centerY * 1.4,
        width: 300,
        height: 300,
        getColor() {
            if (player.health.current === 1) return "white";
            if (player.health.current / player.health.max <= 0.25) return "red";
            if (player.health.current / player.health.max <= 0.5) return "yellow";
            return "green";
        },
        shield: {
            color: "cyan",
            overchargedColor: "magenta",
            transparency: 1
        }
    },

    mana: {
        x: () => barUI.centerX * 1.05,
        y: () => barUI.centerY * 1.4,
        width: 300,
        height: 300,
        getColor() {
            return player.mana.current === player.mana.max ? "white" : "blue";
        }
    },

    xp: {
        x: () => barUI.centerX * 0.7,
        y: () => barUI.centerY * 1.6,
        width: 600,
        height: 300,
        color: "lime"
    },

    renderHealth() {
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.health.getColor();
        ctx.fillRect(
            this.health.x() * 1.025,
            this.health.y() * 1.2,
            this.health.width * 0.9 / (player.health.max / player.health.current),
            this.health.height * 0.1
        );
        ctx.globalAlpha = this.health.shield.transparency;
        ctx.fillStyle = this.health.shield.color;
        ctx.fillRect(
            this.health.x() * 1.025,
            this.health.y() * 1.2,
            this.health.width * 0.9 * (player.shield > player.health.max ? 1 : player.shield / player.health.max),
            this.health.height * 0.05
        );
        ctx.globalAlpha = 1;
        if (player.shield > player.health.max) {
            ctx.fillStyle = this.health.shield.overchargedColor;
            ctx.fillRect(
                this.health.x() * 1.025,
                this.health.y() * 1.2,
                this.health.width * 0.9 * (((player.shield - player.health.max) / player.health.max) > 1 ? 1 : (player.shield - player.health.max) / player.health.max),
                this.health.height * 0.05
            );
        }
        ctx.drawImage(images.Health, this.health.x(), this.health.y(), this.health.width, this.health.height);
    },

    renderMana() {
        ctx.fillStyle = this.mana.getColor();
        ctx.fillRect(
            this.mana.x() * 1.0475,
            this.mana.y() * 1.18,
            this.mana.width * 0.7 / (player.mana.max / player.mana.current),
            this.mana.height * 0.2
        );
        ctx.drawImage(images.Mana, this.mana.x(), this.mana.y(), this.mana.width, this.mana.height);
    },

    renderXp() {
        ctx.fillStyle = this.xp.color;
        ctx.fillRect(
            this.xp.x() * 1.2425,
            this.xp.y() * 1.175,
            this.xp.width * 0.46 / (player.LevelReq / player.experience),
            this.xp.height * 0.1
        );
        ctx.drawImage(images.Xp, this.xp.x(), this.xp.y(), this.xp.width, this.xp.height);
    }
};

// Backward compatibility
let Bar = {
    Health: {
        Location: { get x() { return barUI.health.x(); }, get y() { return barUI.health.y(); } },
        get Width() { return barUI.health.width; },
        get Height() { return barUI.health.height; },
        get Color() { return barUI.health.getColor(); },
        Shield: barUI.health.shield
    },
    Mana: {
        Location: { get x() { return barUI.mana.x(); }, get y() { return barUI.mana.y(); } },
        get Width() { return barUI.mana.width; },
        get Height() { return barUI.mana.height; },
        get Color() { return barUI.mana.getColor(); }
    },
    Xp: {
        Location: { get x() { return barUI.xp.x(); }, get y() { return barUI.xp.y(); } },
        get Width() { return barUI.xp.width; },
        get Height() { return barUI.xp.height; },
        get Color() { return barUI.xp.color; }
    }
};

function Healthbar() { barUI.renderHealth(); }
function ManaBar() { barUI.renderMana(); }
function XpBar() { barUI.renderXp(); }

// ============================================================================
// RENDER ENGINE
// ============================================================================

let gameTexts = [];

const Renderer = {
    drawGameTexts() {
        for (const t of gameTexts) {
            drawText(ctx, t.font, t.text, t.x, t.y, t.scale);
        }
    },

    render() {
        graphics.background.draw();
        barUI.renderHealth();
        barUI.renderMana();
        barUI.renderXp();
        
        if (uiState.backpack) backpackUI.render();
        if (uiState.devbook) DevbookRenderer.render();
        if (uiState.hitboxes) hitboxSystem.draw();
        if (uiState.chat) this.renderChat();
        
        this.drawGameTexts();
    },

    renderChat() {
        // Chat UI implementation goes here
    }
};

// Backward compatibility
function drawGameTexts() { Renderer.drawGameTexts(); }
function Draw() { Renderer.render(); }

// ============================================================================
// GAME LOOP
// ============================================================================

const GameEngine = {
    running: false,

    start() {
        this.running = true;
        this.loop();
    },

    stop() {
        this.running = false;
    },

    loop() {
        Renderer.render();
        if (this.running) {
            requestAnimationFrame(() => this.loop());
        }
    }
};

// Backward compatibility
function Game() { GameEngine.loop(); }

// ============================================================================
// INITIALIZATION
// ============================================================================

const AppInitializer = {
    init() {
        flattenImageAssets();
        return Promise.all([
            ImageLoader.loadImages(images),
            FontManager.loadAll()
        ]).then(([loadedImages]) => {
            images = loadedImages;
            EventManager.init();
            GameEngine.start();
            console.log("Game initialized successfully");
        }).catch(err => {
            console.error("Failed to initialize game:", err);
        });
    }
};

// Start the game
AppInitializer.init();