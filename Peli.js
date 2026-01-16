// ============================================================================
// CANVAS
// ============================================================================
const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ============================================================================
// TIME
// ============================================================================

let timeScale = 1;
let lastFrameTime = performance.now();

// ============================================================================
// PLAYER
// ============================================================================

let Player = {
    position: { x: 0, y: 0 },
    stats: { Agility: 4 },
    appearance: { color: "white", size: 20, shape: "Circle" },
    MaxHealth: 10,
    Health: 10,
    flashTime: 0,
    weapon: {
        Projectiles: [],
        Projectile: {
            appearance: { color: "orange", size: 5 },
            stats: { range: 400, speed: 14, rate: 6 }
        }
    }
};
// ============================================================================
// Items
// ============================================================================

let Items = {
    // Materials

    Soul: {
        Description: "Essense of your enemies",
        Type: "Material" // (Craft tulee myöhemmin)
    },
    // Consumeables

    HealthCube: {
        Description: "Gelatin of life",
        type: "Consumeable",
        Effects: "" // (Tulevat vaikutukset)
    },
    // Equipment

    // (Tulevat myöhemmin)

    // Special

    Enemylog: {
        Description: "List of all enemies",
        type: "Unlocks"
    }
    
}
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

let Hotbar = [
    {},
    {},
    {},
    {}
];

let selectedSlot = null; // Aloitus: pelaajalla on ase valittuna

// ============================================================================
// CAMERA
// ============================================================================

let camera = {
    world: { x: 0, y: 0 },
    screen: { x: canvas.width / 2, y: canvas.height / 2 },
    offset: { x: 0, y: 0 },
    maxOffset: 240,
    offsetSmooth: 0.18,
    shake: { intensity: 0, decay: 0.85 }
};

// ============================================================================
// INPUT
// ============================================================================

let keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

let mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

let isShooting = false;
canvas.addEventListener("mousedown", () => isShooting = true);
canvas.addEventListener("mouseup", () => isShooting = false);

window.addEventListener("keydown", e => {
    if (e.key >= "1" && e.key <= "4") {
        const slotIndex = parseInt(e.key) - 1;

        if (selectedSlot === slotIndex) {
            selectedSlot = null;
        } else {
            selectedSlot = slotIndex;
        }
    }
});

// ============================================================================
// Music
// ============================================================================

const Themes = {
    Peaceful: "Ost/Peaceful.mp3"
};

let currentMusic = null;
let musicStarted = false;
let musicStoppedOnDeath = false;

function PlayMusic(theme) {
    if (musicStarted) return;

    currentMusic = new Audio(Themes[theme]);
    currentMusic.loop = true;
    currentMusic.volume = 0.5;

    currentMusic.play()
        .then(() => musicStarted = true)
        .catch(() => {});
}

function PauseMusic() {
    if (!currentMusic || currentMusic.paused) return;
    currentMusic.pause();
}

function StopMusic() {
    if (!currentMusic) return;
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
    musicStarted = false;
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        PauseMusic();
    } else {
        if (currentMusic && isPlayerAlive()) {
            currentMusic.play().catch(() => {});
        }
    }
});

canvas.addEventListener("mousedown", () => {
    if (!currentMusic && isPlayerAlive()) {
        PlayMusic("Peaceful");
    }
}, { once: true });


// ============================================================================
// CAMERA AIM
// ============================================================================

function Aim() {
    const dx = mouse.x - camera.screen.x;
    const dy = mouse.y - camera.screen.y;
    const dist = Math.hypot(dx, dy) || 1;

    const clamped = Math.min(dist, camera.maxOffset);
    const targetX = dx / dist * clamped;
    const targetY = dy / dist * clamped;

    camera.offset.x += (targetX - camera.offset.x) * camera.offsetSmooth;
    camera.offset.y += (targetY - camera.offset.y) * camera.offsetSmooth;

    camera.world.x = Player.position.x + camera.offset.x;
    camera.world.y = Player.position.y + camera.offset.y;

    if (camera.shake.intensity > 0) {
        camera.world.x += (Math.random() - 0.5) * camera.shake.intensity;
        camera.world.y += (Math.random() - 0.5) * camera.shake.intensity;
        camera.shake.intensity *= camera.shake.decay;
    }
}

// ============================================================================
// DAMAGE
// ============================================================================

function applyDamage(entity, dmg) {
    entity.Health -= dmg;
    entity.flashTime = 120;

    if (entity === Player) {
        camera.shake.intensity = Math.min(camera.shake.intensity + 14, 30);
    }
}

// ============================================================================
// DAMAGE FLASH
// ============================================================================

function drawDamageFlash(entity) {
    if (entity.flashTime <= 0) return;

    const wx = entity.position?.x ?? entity.x;
    const wy = entity.position?.y ?? entity.y;

    const sx = camera.screen.x + (wx - camera.world.x);
    const sy = camera.screen.y + (wy - camera.world.y);

    ctx.strokeStyle = "rgba(255,0,0,0.9)";
    ctx.lineWidth = 3;

    const baseSize = entity.appearance?.size ?? entity.Size ?? 20;
    const flashMultiplier = 1; 
    const size = baseSize * flashMultiplier;

    const shape = entity.appearance?.shape ?? entity.shape ?? "Square";

    if (shape === "Circle") {
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.strokeRect(
            sx - size / 2,
            sy - size / 2,
            size,
            size
        );
    }

    entity.flashTime -= 16 * timeScale;
}

// ============================================================================
// SLOW MOTION (LOW HP)
// ============================================================================

function updateTimeScale() {
    const hp = Math.max(Player.Health / Player.MaxHealth, 0);
    if (hp >= 0.5) {
        timeScale = 1;
    } else {
        timeScale = 0.35 + (hp / 0.5) * 0.65;
    }
}

// ============================================================================
// DEATH
// ============================================================================

function isPlayerAlive() {
    return Player.Health > 0;
}

if (!isPlayerAlive() && !musicStoppedOnDeath) {
    StopMusic();
    musicStoppedOnDeath = true;
}

// ============================================================================
// BULLETS
// ============================================================================

let lastShotTime = 0;

function reload() {
    const now = performance.now();
    if (now - lastShotTime >= 1000 / Player.weapon.Projectile.stats.rate) {
        createBullet();
        lastShotTime = now;
    }
}

function createBullet() {
    const dx = camera.offset.x;
    const dy = camera.offset.y;
    const dist = Math.hypot(dx, dy) || 1;

    Player.weapon.Projectiles.push({
        x: Player.position.x,
        y: Player.position.y,
        vx: dx / dist * Player.weapon.Projectile.stats.speed,
        vy: dy / dist * Player.weapon.Projectile.stats.speed,
        traveled: 0,
        range: Player.weapon.Projectile.stats.range,
        size: Player.weapon.Projectile.appearance.size,
        color: Player.weapon.Projectile.appearance.color
    });
}

function updateBullets(dt) {
    for (let i = Player.weapon.Projectiles.length - 1; i >= 0; i--) {
        const b = Player.weapon.Projectiles[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.traveled += Math.hypot(b.vx, b.vy) * dt;

        for (let j = Enemies.length - 1; j >= 0; j--) {
            const e = Enemies[j];
            if (Math.hypot(b.x - e.x, b.y - e.y) < (b.size + e.Size) / 2) {
                applyDamage(e, 1);
                Player.weapon.Projectiles.splice(i, 1);
                if (e.Health <= 0) Enemies.splice(j, 1);
                break;
            }
        }

        if (b.traveled > b.range) Player.weapon.Projectiles.splice(i, 1);
    }
}

// ============================================================================
// Structures
// ============================================================================
let Buildings = []
let BuildingTypes = {
    Walls: {
        wood: {
            Size: 20,
            Color: "brown",
            Health: 100,
            Defence: 0
        },
        brick: {
            Size: 30,
            Color: "darkred",
            Health: 800,
            Defence: 5
        },
        stone: {
            Size: 50,
            Color: "grey",
            Health: 5000,
            Defence: 25
        },
        stone_reinforced: {
            Size: 50,
            Color: "darkgrey",
            Health: 25000,
            Defence: 250
        },
        metal: {
            Size: 50,
            Color: "white",
            Health: 1000000,
            Defence: 1000
        },
        metal_reinforced: {
            Size: 50,
            Color: "lightgrey",
            Health: 1000000000,
            Defence: 10000
        }
    },
    Containers: {
        common: {
            Size: 50,
            color: "lightergrey",
            Health: 5,
            Defence: 1
        },
        uncommon: {
            Size: 50,
            color: "green",
            Health: 50,
            Defence: 1
        },
        rare: {
            Size: 50,
            color: "cyan",
            Health: 100,
            Defence: 5
        },
        epic: {
            Size: 80,
            color: "violet",
            Health: 1000,
            Defence: 10
        },
        legendary: {
            Size: 200,
            color: "yellow",
            Health: 2500,
            Defence: 25
        },
        mythic: {
            Size: 500,
            color: "red",
            Health: 10000,
            Defence: 100
        }
    }
}
// ============================================================================
// Hitboxes
// ============================================================================

// ============================================================================
// ENEMIES (MELEE WITH COOLDOWN)
// ============================================================================

let Enemies = [];

const EnemyTypes = {

    Grunt: {
        Size: 20,
        Color: "red",
        Health: 3,
        Agility: 1.6,
        Strength: 3,
        attackRate: 0.8,
        rarity: 0 // 0 = yleisin
    },
    Fast: {
        Size: 14,
        Color: "cyan",
        Health: 2,
        Agility: 5.2,
        Strength: 1,
        attackRate: 0.5,
        rarity: 1 // keskitaso
    },
    Tank: {
        Size: 30,
        Color: "blue",
        Health: 16,
        Agility: 1,
        Strength: 4,
        attackRate: 2,
        rarity: 2 // harvinainen
    }
};

function getOffscreenSpawnPosition() {
    const minX = camera.world.x - canvas.width / 2;
    const maxX = camera.world.x + canvas.width / 2;
    const minY = camera.world.y - canvas.height / 2;
    const maxY = camera.world.y + canvas.height / 2;

    const maxDistX = canvas.width;
    const maxDistY = canvas.height;

    let x, y;
    const side = Math.floor(Math.random() * 4);

    switch (side) {
        case 0: x = minX - Math.random() * maxDistX; y = minY + Math.random() * canvas.height; break;
        case 1: x = maxX + Math.random() * maxDistX; y = minY + Math.random() * canvas.height; break;
        case 2: x = minX + Math.random() * canvas.width; y = minY - Math.random() * maxDistY; break;
        case 3: x = minX + Math.random() * canvas.width; y = maxY + Math.random() * maxDistY; break;
    }

    return { x, y };
}

function spawnEnemy() {
    const roll = Math.random();
    let rarity;

    if (roll < 0.6) rarity = 0;
    else if (roll < 0.9) rarity = 1;
    else rarity = 2;

    const candidates = Object.entries(EnemyTypes)
        .filter(([_, data]) => data.rarity === rarity);

    const [typeName, type] = candidates[Math.floor(Math.random() * candidates.length)];

    const pos = getOffscreenSpawnPosition();

    Enemies.push({
        ...type,
        x: pos.x,
        y: pos.y,
        attackCooldown: 0,
        flashTime: 0,
        shape: type.shape ?? "Square"
    });
}

// ============================================================================
// DRAW
// ============================================================================

function drawPlayer() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
        camera.screen.x + (Player.position.x - camera.world.x),
        camera.screen.y + (Player.position.y - camera.world.y),
        Player.appearance.size,
        0, Math.PI * 2
    );
    ctx.fill();
    drawDamageFlash(Player);
}

function drawEnemies() {
    Enemies.forEach(e => {
        ctx.fillStyle = e.Color;
        ctx.fillRect(
            camera.screen.x + (e.x - camera.world.x) - e.Size / 2,
            camera.screen.y + (e.y - camera.world.y) - e.Size / 2,
            e.Size, e.Size
        );
        drawDamageFlash(e);
    });
}

function drawBullets() {
    Player.weapon.Projectiles.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(
            camera.screen.x + (b.x - camera.world.x) - b.size / 2,
            camera.screen.y + (b.y - camera.world.y) - b.size / 2,
            b.size, b.size
        );
    });
}

function drawHotbar() {
    const slotSize = 50;
    const spacing = 10;
    const totalWidth = slotSize * Hotbar.length + spacing * (Hotbar.length - 1);
    const startX = (canvas.width - totalWidth) / 2;
    const y = canvas.height - 100;

    for (let i = 0; i < Hotbar.length; i++) {
        const slot = Hotbar[i];
        const x = startX + i * (slotSize + spacing);

        // Korostus valitulle slotille
        ctx.fillStyle = selectedSlot === i ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.6)";
        ctx.fillRect(x, y, slotSize, slotSize);

        // Kehys
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, slotSize, slotSize);

        // Icon
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(slot.icon, x + slotSize / 2, y + slotSize / 2);

        // Määrä pienellä tekstillä oikeassa alakulmassa
        if (slot.count > 0) {
            ctx.font = "14px Arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(slot.count, x + slotSize - 4, y + slotSize - 4);
        }
    }

    // Näytetään aseen valinta, jos selectedSlot on null
    if (selectedSlot === null) {
        ctx.fillStyle = "yellow";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Ase valittuna", canvas.width / 2, y - 20);
    }
}

// ============================================================================
// HUD
// ============================================================================

function drawHealthBar() {
    const w = 320;
    const h = 18;
    const x = (canvas.width - w) / 2;
    const y = canvas.height - 50;

    const hp = Math.max(Player.Health / Player.MaxHealth, 0);

    // Tausta
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);

    // Väri riippuu HP:sta
    ctx.fillStyle = hp > 0.9 ? "lime" : hp > 0.75 ? "yellow" : hp > 0.50 ? "orange" : hp > 0.25 ? "red": "white" ;
    ctx.fillRect(x, y, w * hp, h);

    // Kehys
    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, w, h);

    // Teksti
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Player.Health} / ${Player.MaxHealth}`, x + w / 2, y + h / 2);
}

// ============================================================================
// VISION LOSS
// ============================================================================

function drawVisionLoss() {
    const hp = Math.max(Player.Health / Player.MaxHealth, 0);

    // Jos HP yli 50%, ei väriä muuteta
    if (hp >= 0.75) {
        ctx.filter = "none";
        return;
    }

    const desaturation = 1 - (hp / 0.5); // 0..1
    ctx.filter = `grayscale(${desaturation * 100}%)`;
}

// ============================================================================
// UPDATE
// ============================================================================
function Update() {
    const now = performance.now();
    const delta = (now - lastFrameTime) / 16.666;
    lastFrameTime = now;

    updateTimeScale();
    const dt = delta * timeScale;

    if (isPlayerAlive()) {
        if (keys["w"]) Player.position.y -= Player.stats.Agility * dt;
        if (keys["s"]) Player.position.y += Player.stats.Agility * dt;
        if (keys["a"]) Player.position.x -= Player.stats.Agility * dt;
        if (keys["d"]) Player.position.x += Player.stats.Agility * dt;
    }

    Aim();

    if (isShooting && isPlayerAlive()) reload();

    Enemies.forEach(e => {
        const dx = Player.position.x - e.x;
        const dy = Player.position.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;

        e.x += dx / dist * e.Agility * dt;
        e.y += dy / dist * e.Agility * dt;

        if (e.attackCooldown > 0) e.attackCooldown -= dt / 60;

        if (
            isPlayerAlive() &&
            dist < (Player.appearance.size + e.Size) / 2 &&
            e.attackCooldown <= 0
        ) {
            applyDamage(Player, e.Strength);
            e.attackCooldown = e.attackRate;
        }
    });

    updateBullets(dt);
}

// ============================================================================
// GAME LOOP
// ============================================================================

function GameLoop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Update();

    if (Math.random() < 0.01) spawnEnemy();

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawHealthBar();
    drawVisionLoss();
    drawHotbar();

    requestAnimationFrame(GameLoop);
}

GameLoop();