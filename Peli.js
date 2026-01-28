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
    width: canvas.width,
    height: canvas.height
}

function CreateBackground() {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, background.width, background.height);
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
};

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
        results.forEach(result => loadedImages[result.key] = result.img);
        return loadedImages;
    });
}

// ============================================================================
// FONTS
// ============================================================================

const FontsList = {
    Player: { src: "../Graphics/Fonts/Orange_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
    Enemy: { src: "../Graphics/Fonts/Red_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
    Info: { src: "../Graphics/Fonts/Info_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 8 },
    Deadlyweather: { src: "../Graphics/Fonts/Deadlyweather_Text.png", chars: ` !"#$&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ[]^_'~`, size: 16 }
};

function loadFont(fontName) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = FontsList[fontName].src;
        img.onload = () => { FontsList[fontName].image = img; resolve(); };
        img.onerror = () => { console.warn("Font failed to load: " + FontsList[fontName].src); resolve(); };
    });
}

function loadFonts() {
    return Promise.all(Object.keys(FontsList).map(name => loadFont(name)));
}

function drawText(ctx, fontName, text, x, y, scale = 1) {
    const font = FontsList[fontName];
    if (!font || !font.image) {
        ctx.save(); ctx.fillStyle = "red"; ctx.font = `${16*scale}px Arial`; ctx.fillText(text, x, y + 16*scale); ctx.restore(); return;
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
}

// ============================================================================
// TIME & CAMERA
// ============================================================================

let timeScale = 1, time = 0;
let centerX = canvas.width / 2, centerY = canvas.height / 2;
let screenX = canvas.width, screenY = canvas.height;

let camera = { position: {x:0, y:0}, screen: {x:centerX, y:centerY}, offset:{x:0,y:0}, maxOffset:500 };

// ============================================================================
// PLAYER
// ============================================================================

let Player = { position:{x:0,y:0}, appearance:{size:20}, MaxHealth:10, Health:10, Shield:0, MaxMana:1, Mana:1, Level:0, Experience:100, Requirement:100, stats:{Strength:1, Agility:1, Intelligence:1, Vitality:0}, points:0 };

// ============================================================================
// INPUT & KEYBINDS
// ============================================================================

let Keys = {};
let Keybinds = {Settings:"o", MoveNorth:"w", MoveWest:"a", MoveSouth:"s", MoveEast:"d", Ranged:"Mouse1", Ranged_Ultimate:"Ctrl", Melee:"Mouse2", Melee_Ultimate:"Space", Dash:"Shift", Backpack:"§", HotbarKeys:{1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"0"}, Interact:"e", Skills:"l", Confirm:"Enter", Devbook:"p", Hitbox:"i", Chat:"t"};

// ============================================================================
// UI STATUS
// ============================================================================

let opened = {Settings:false, Backpack:false, Devbook:false, Hitboxes:false, Chat:false};

// ============================================================================
// DEVBOOK
// ============================================================================

let Devbook = {
    x: 300,
    y: 50,
    size: 600,

    tabSize: { w: 128, h: 64 },
    scroll: 0,
    activeTab: "Art",

    selector: {
        get x() { return Devbook.x + Devbook.size + 5; },
        get y() { return Devbook.y; }
    },

    tabs: [
        { id: "Art",  title: "Art" },
        { id: "Item", title: "Items" },
        { id: "Stat", title: "Stats" }
    ]
}

const DevbookContent = {
    Art: ["ART TAB"],
    Item: ["ITEMS TAB"],
    Stat: ["STATS TAB"]
};

function SummonDevPanel(){
    if(!Devbook || !images.Body) return;

    

    ctx.drawImage(images.Body, Devbook.x, Devbook.y, Devbook.size, Devbook.size);

    for(let i=0;i<Devbook.tabs.length;i++){
        const tab = Devbook.tabs[i];
        const x = Devbook.selector.x;
        const y = Devbook.selector.y + i*(Devbook.tabSize.h*1.1);
        const w = Devbook.tabSize.w;
        const h = Devbook.tabSize.h;

        if(images[tab.id]) ctx.drawImage(images[tab.id], x, y, w, h);

        drawText(ctx, "Player", tab.title, x + 10, y + 20, 1);
    }

    drawText(ctx,"Info","Devbook",Devbook.x*1.275,Devbook.y+50,4);

    drawText(ctx,"Player",
        "Sinun hp: "+Player.Health+"/"+Player.MaxHealth+"\n"+
        "Sinun Mana: "+Player.Mana+"/"+Player.MaxMana,
        Devbook.x*1.275,
        Devbook.y+140,
        1
    );

    // ==========================
    // AKTIIVISEN TABIN SISÄLTÖ
    // ==========================

    const lines = DevbookContent[Devbook.activeTab] || ["EMPTY TAB"];
    for (let i = 0; i < lines.length; i++) {
    drawText(ctx, "Player", lines[i], Devbook.x + 40, Devbook.y + 80 + i * 20, 1);
    }

    function DrawDevbookPage(){
    if(Devbook.activeTab === "Art"){
        drawText(ctx,"Player","ART PAGE", Devbook.x+40, Devbook.y+80, 1);
    }
    if(Devbook.activeTab === "Item"){
        drawText(ctx,"Player","ITEM PAGE", Devbook.x+40, Devbook.y+80, 1);
    }
    if(Devbook.activeTab === "Stat"){
        drawText(ctx,"Player","STAT PAGE", Devbook.x+40, Devbook.y+80, 1);
    }
}
DrawDevbookPage();
}

// ============================================================================
// HITBOX
// ============================================================================

let Hitbox = {Hitboxes:[]};
function CreateDevbookHitboxes(){
    Hitbox.Hitboxes = [];
    for(let i=0;i<Devbook.tabs.length;i++){
        const tab = Devbook.tabs[i];
        const x = Devbook.selector.x, y = Devbook.selector.y + i*(Devbook.tabSize.h*1.1), w = Devbook.tabSize.w, h = Devbook.tabSize.h;
        Hitbox.Hitboxes.push({id:tab.id,x:x,y:y,width:w,height:h,Tags:["UI"], trigger:()=>{Devbook.activeTab=tab.id; console.log("Klikattu Devbook tab:",tab.id);}});
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener("keydown", (e)=>{
    if(e.key===Keybinds.Backpack) opened.Backpack=!opened.Backpack;
    if(e.key===Keybinds.Devbook){ opened.Devbook=!opened.Devbook; if(opened.Devbook) CreateDevbookHitboxes(); }
    if(e.key===Keybinds.Hitbox) opened.Hitboxes=!opened.Hitboxes;
    if(e.key===Keybinds.Chat) opened.Chat=!opened.Chat;
});

canvas.addEventListener("click",(e)=>{
    const mouseX=e.clientX, mouseY=e.clientY;
    for(let hb of Hitbox.Hitboxes){
        if(!hb.Tags.includes("UI")) continue;
        if(mouseX>=hb.x && mouseX<=hb.x+hb.width && mouseY>=hb.y && mouseY<=hb.y+hb.height){
            if(hb.trigger) hb.trigger();
        }
    }
});

document.addEventListener("wheel", (e)=>{ if(!opened.Backpack) return; ScrollInventory(e.deltaY); });

// ============================================================================
// SCROLL FUNCTIONS
// ============================================================================

function ScrollInventory(Amount){Backpack.RollY+=Amount;}
function ScrollImages(Amount){Devbook.scroll+=Amount;}
function ScrollChat(Amount){Chat.scroll+=Amount;}

// ============================================================================
// BACKPACK & DEVBOOK DRAW FUNCTIONS
// ============================================================================

let Backpack={x:centerX*0.75,y:50,width:600,height:600,SlotX:8,SlotY:8,SlotSize:50,RollY:0,SlotDistance:8,get GridPos(){const gw=this.SlotX*this.SlotSize+(this.SlotX-1)*this.SlotDistance; const gh=this.SlotY*this.SlotSize+(this.SlotY-1)*this.SlotDistance; return {x:(this.width-gw)/2, y:(this.height-gh)/2};},Inventory:[]};

function OpenBackpack(){ ctx.drawImage(images.Inventory, Backpack.x, Backpack.y, Backpack.width, Backpack.height); Slots(); }
function Slots(){ for(let plotY=0;plotY<Backpack.SlotY;plotY++){for(let plotX=0;plotX<Backpack.SlotX;plotX++){const slotX=Backpack.x+Backpack.GridPos.x+plotX*(Backpack.SlotSize+Backpack.SlotDistance); const slotY=Backpack.y+Backpack.GridPos.y+plotY*(Backpack.SlotSize+Backpack.SlotDistance)+Backpack.RollY; ctx.drawImage(images.Slot, slotX, slotY, Backpack.SlotSize, Backpack.SlotSize); }}}

function ShowHitboxes() {
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    for (let hitbox of Hitbox.Hitboxes) {
        if (hitbox.Tags.includes("UI") && opened.Devbook) {
            ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        }
    }

    ctx.restore();
}

// ============================================================================
// BARS
// ============================================================================

let Bar={Health:{Location:{x:centerX*0.65,y:centerY*1.4},Width:300,Height:300,Color:Player.Health===1?"white":Player.Health/Player.MaxHealth<=0.25?"red":Player.Health/Player.MaxHealth<=0.5?"yellow":"green", Shield:{Color:"cyan",Overcharged:{Color:"magenta"},Transparency:1}}, Mana:{Location:{x:centerX*1.05,y:centerY*1.4},Width:300,Height:300,Color:Player.Mana===Player.MaxMana?"white":"blue"}, Xp:{Location:{x:centerX*0.7,y:centerY*1.6},Width:600,Height:300,Color:"lime"}};

function Healthbar(){ctx.globalAlpha=1;ctx.fillStyle=Bar.Health.Color;ctx.fillRect(Bar.Health.Location.x*1.025,Bar.Health.Location.y*1.2,Bar.Health.Width*0.9/(Player.MaxHealth/Player.Health),Bar.Health.Height*0.1); ctx.globalAlpha=Bar.Health.Shield.Transparency; ctx.fillStyle=Bar.Health.Shield.Color; ctx.fillRect(Bar.Health.Location.x*1.025,Bar.Health.Location.y*1.2,Bar.Health.Width*0.9*(Player.Shield>Player.MaxHealth?1:Player.Shield/Player.MaxHealth),Bar.Health.Height*0.05); ctx.globalAlpha=1; if(Player.Shield>Player.MaxHealth){ctx.fillStyle=Bar.Health.Shield.Overcharged.Color;ctx.fillRect(Bar.Health.Location.x*1.025,Bar.Health.Location.y*1.2,Bar.Health.Width*0.9*((Player.Shield-Player.MaxHealth)/Player.MaxHealth>1?1:(Player.Shield-Player.MaxHealth)/Player.MaxHealth),Bar.Health.Height*0.05);}ctx.drawImage(images.Health,Bar.Health.Location.x,Bar.Health.Location.y,Bar.Health.Width,Bar.Health.Height);}
function ManaBar(){ctx.fillStyle=Bar.Mana.Color; ctx.fillRect(Bar.Mana.Location.x*1.0475,Bar.Mana.Location.y*1.18,Bar.Mana.Width*0.7/(Player.MaxMana/Player.Mana),Bar.Mana.Height*0.2); ctx.drawImage(images.Mana,Bar.Mana.Location.x,Bar.Mana.Location.y,Bar.Mana.Width,Bar.Mana.Height);}
function XpBar(){ctx.fillStyle=Bar.Xp.Color; ctx.fillRect(Bar.Xp.Location.x*1.2425,Bar.Xp.Location.y*1.175,Bar.Xp.Width*0.46/(Player.Requirement/Player.Experience),Bar.Xp.Height*0.1); ctx.drawImage(images.Xp,Bar.Xp.Location.x,Bar.Xp.Location.y,Bar.Xp.Width,Bar.Xp.Height);}

// ============================================================================
// DRAW & GAME LOOP
// ============================================================================
let gameTexts=[];
function drawGameTexts(){for(const t of gameTexts) drawText(ctx,t.font,t.text,t.x,t.y,t.scale);}

function Draw(){CreateBackground(); Healthbar(); ManaBar(); XpBar(); if(opened.Backpack) OpenBackpack(); if(opened.Devbook) SummonDevPanel(); if(opened.Hitboxes) ShowHitboxes(); if(opened.Chat) ActivateChat();}

function Game(){Draw(); requestAnimationFrame(Game);}

// ============================================================================
// START
// ============================================================================
Promise.all([loadImages(images), loadFonts()]).then(([loadedImages])=>{ images=loadedImages; Game(); }).catch(err=>console.error(err));
