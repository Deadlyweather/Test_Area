// ============================================================================
//                               CANVAS
// ============================================================================
const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ============================================================================
//                               PLAYER
// ============================================================================
let Player = {
    position: { x: 0, y: 0 },
    stats: { Agility: 2, Intelligence: 1 },
    appearance: { color: "white", size: 20, shape: "Circle" },
    Health: 10,
    flashTime: 0,
    weapon: {
        Projectiles: [],
        Projectile: {
            appearance: { color: "orange", size: 5, shape: "Square" },
            stats: { range: 300, speed: 10, rate: 5 }
        }
    }
};

// ============================================================================
//                               CAMERA
// ============================================================================
let camera = {
    world: { x: 0, y: 0 },
    screen: { x: canvas.width / 2, y: canvas.height / 2 },
    aim: { coord: { x: 0, y: 0 }, maxDistance: 200 }
};

// ============================================================================
//                               GRID
// ============================================================================
let Grid = { size: 50, color: "white" };

// ============================================================================
//                               KEYS
// ============================================================================
let keybinds = { Move_Up: "w", Move_Left: "a", Move_Down: "s", Move_Right: "d" };
let keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ============================================================================
//                               MOUSE
// ============================================================================
let mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// ============================================================================
//                               SHOOTING
// ============================================================================
let isShooting = false;
let lastShotTime = 0;

canvas.addEventListener("mousedown", () => isShooting = true);
canvas.addEventListener("mouseup", () => isShooting = false);

function reload() {
    const now = Date.now();
    if (now - lastShotTime >= 1000 / Player.weapon.Projectile.stats.rate) {
        createBullet();
        lastShotTime = now;
    }
}

function createBullet() {
    const worldMouseX = Player.position.x + (mouse.x - camera.screen.x);
    const worldMouseY = Player.position.y + (mouse.y - camera.screen.y);

    const dx = worldMouseX - Player.position.x;
    const dy = worldMouseY - Player.position.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = Player.weapon.Projectile.stats.speed;

    Player.weapon.Projectiles.push({
        x: Player.position.x,
        y: Player.position.y,
        vx: dx / dist * speed,
        vy: dy / dist * speed,
        traveled: 0,
        range: Player.weapon.Projectile.stats.range,
        size: Player.weapon.Projectile.appearance.size,
        color: Player.weapon.Projectile.appearance.color
    });
}

function updateBullets() {
    for (let i = Player.weapon.Projectiles.length - 1; i >= 0; i--) {
        const b = Player.weapon.Projectiles[i];
        b.x += b.vx;
        b.y += b.vy;
        b.traveled += Math.sqrt(b.vx*b.vx + b.vy*b.vy);

        // Bullet hits enemies
        for (let j = Enemies.length - 1; j >= 0; j--) {
            const e = Enemies[j];
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < (b.size + e.Size)/2) {
                applyDamage(e, 1);
                Player.weapon.Projectiles.splice(i, 1);
                if (e.Health <= 0) Enemies.splice(j, 1);
                break;
            }
        }

        if (b.traveled > b.range) Player.weapon.Projectiles.splice(i,1);
    }
}

function drawBullets() {
    Player.weapon.Projectiles.forEach(b => {
        const screenX = camera.screen.x + (b.x - camera.world.x);
        const screenY = camera.screen.y + (b.y - camera.world.y);
        ctx.fillStyle = b.color;
        ctx.fillRect(screenX - b.size/2, screenY - b.size/2, b.size, b.size);
    });
}

// ============================================================================
//                               DAMAGE FLASH
// ============================================================================
function applyDamage(entity, dmg) {
    entity.Health -= dmg;
    entity.flashTime = 200;
}

function drawDamageFlash(entity) {
    if (entity.flashTime <= 0) return;

    const screenX = camera.screen.x + ((entity.position?.x ?? entity.x ?? 0) - camera.world.x);
    const screenY = camera.screen.y + ((entity.position?.y ?? entity.y ?? 0) - camera.world.y);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    const margin = 4;

    if ((entity.appearance?.shape ?? entity.shape) === "Circle") {
        const radius = (entity.appearance?.size ?? entity.size) + margin;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI*2);
        ctx.stroke();
    } else {
        const size = (entity.appearance?.size ?? entity.size) + margin;
        ctx.strokeRect(screenX - size/2, screenY - size/2, size, size);
    }

    entity.flashTime -= 16;
}

// ============================================================================
//                               CAMERA AIM
// ============================================================================
function Aim() {
    const dx = mouse.x - camera.screen.x;
    const dy = mouse.y - camera.screen.y;
    const distance = Math.sqrt(dx*dx + dy*dy);

    let factor = 1;
    if (distance > camera.aim.maxDistance) factor = camera.aim.maxDistance / distance;

    camera.aim.coord.x = dx * factor;
    camera.aim.coord.y = dy * factor;

    camera.world.x = Player.position.x + camera.aim.coord.x;
    camera.world.y = Player.position.y + camera.aim.coord.y;
}

// ============================================================================
//                               ENEMIES
// ============================================================================
let Enemies = [];
let EnemyTemplate = { appearance: {Color: "darkred", size: 20, shape: "Square"}, stats: {Health: 3, Agility: 1, Strength: 1} };

function spawnEnemy() {
    const minDist = 200;
    const angle = Math.random() * Math.PI * 2;
    const dist = minDist + Math.random() * 300;
    const spawnX = Player.position.x + Math.cos(angle) * dist;
    const spawnY = Player.position.y + Math.sin(angle) * dist;

    Enemies.push({
        x: spawnX,
        y: spawnY,
        Size: EnemyTemplate.appearance.size,
        Color: EnemyTemplate.appearance.Color,
        Health: EnemyTemplate.stats.Health,
        Agility: EnemyTemplate.stats.Agility,
        Strength: EnemyTemplate.stats.Strength,
        flashTime: 0,
        shape: EnemyTemplate.appearance.shape
    });
}

function drawEnemies() {
    Enemies.forEach(e => {
        const screenX = camera.screen.x + (e.x - camera.world.x);
        const screenY = camera.screen.y + (e.y - camera.world.y);
        ctx.fillStyle = e.Color;
        ctx.fillRect(screenX - e.Size/2, screenY - e.Size/2, e.Size, e.Size);
        drawDamageFlash(e);
    });
}

// ============================================================================
//                               GRID & PLAYER
// ============================================================================
function Spawn(player) {
    const screenX = camera.screen.x + (player.position.x - camera.world.x);
    const screenY = camera.screen.y + (player.position.y - camera.world.y);
    ctx.fillStyle = player.appearance.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, player.appearance.size, 0, Math.PI*2);
    ctx.fill();
    drawDamageFlash(player);
}

function GridMode(camera) {
    ctx.strokeStyle = Grid.color;
    ctx.lineWidth = 1;

    const startX = camera.world.x - camera.screen.x;
    const startY = camera.world.y - camera.screen.y;

    for (let x = startX % Grid.size; x < canvas.width; x += Grid.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = startY % Grid.size; y < canvas.height; y += Grid.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawTexts() {
    ctx.font = `14px Arial`;
    ctx.fillStyle = "yellow";
    ctx.fillText(`Health: ${Player.Health}`, 10, 50);
    ctx.fillStyle = "lime";
    ctx.fillText(`Agility: ${Player.stats.Agility}`, 10, 100);
}

// ============================================================================
//                               UPDATE
// ============================================================================
function Update() {
    if (keys[keybinds.Move_Up]) Player.position.y -= Player.stats.Agility;
    if (keys[keybinds.Move_Down]) Player.position.y += Player.stats.Agility;
    if (keys[keybinds.Move_Left]) Player.position.x -= Player.stats.Agility;
    if (keys[keybinds.Move_Right]) Player.position.x += Player.stats.Agility;

    Aim();

    if (isShooting) reload();

    Enemies.forEach(e => {
        const dx = Player.position.x - e.x;
        const dy = Player.position.y - e.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
            e.x += (dx/dist) * e.Agility;
            e.y += (dy/dist) * e.Agility;
        }
        if (dist < (Player.appearance.size + e.Size)/2) applyDamage(Player, e.Strength);
    });
}

// ============================================================================
//                               GAME LOOP
// ============================================================================
function GameLoop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Update();
    updateBullets();

    if (Math.random() < 0.01) spawnEnemy();

    GridMode(camera);
    Spawn(Player);
    drawBullets();
    drawEnemies();
    drawTexts();

    requestAnimationFrame(GameLoop);
}

GameLoop();