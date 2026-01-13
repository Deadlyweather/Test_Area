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

// ============================================================================
// HELPERS
// ============================================================================
function isPlayerAlive() {
    return Player.Health > 0;
}

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

    // Flashin koko suhteutetaan entiteetin kokoon
    const baseSize = entity.appearance?.size ?? entity.Size ?? 20;
    const flashMultiplier = 1.3; // kuinka paljon flash on suurempi kuin entiteetti
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
// ENEMIES (MELEE WITH COOLDOWN)
// ============================================================================
let Enemies = [];

function spawnEnemy() {
    const a = Math.random() * Math.PI * 2;
    const d = 300 + Math.random() * 200;

    Enemies.push({
        x: Player.position.x + Math.cos(a) * d,
        y: Player.position.y + Math.sin(a) * d,
        Size: 20,
        Color: "darkred",
        Health: 3,
        Agility: 1.6,
        Strength: 1,
        flashTime: 0,

        attackCooldown: 0,
        attackRate: 0.8
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

// ============================================================================
// HUD
// ============================================================================
function drawHealthBar() {
    const w = 320;
    const h = 18;
    const x = (canvas.width - w) / 2;
    const y = canvas.height - 50;

    const hp = Math.max(Player.Health / Player.MaxHealth, 0);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);

    ctx.fillStyle = hp > 0.25 ? "lime" : hp > 0.1 ? "orange" : "red";
    ctx.fillRect(x, y, w * hp, h);

    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, w, h);
}

// ============================================================================
// VISION LOSS
// ============================================================================
function drawVisionLoss() {
    const hp = Math.max(Player.Health / Player.MaxHealth, 0);
    if (hp >= 0.5) return;

    const strength = hp <= 0 ? 1 : 1 - hp / 0.5;
    const alpha = 0.95 * strength;

    const g = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.08,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );

    g.addColorStop(0, `rgba(0,0,0,${alpha * 0.4})`);
    g.addColorStop(1, `rgba(0,0,0,${alpha})`);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (hp <= 0) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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

    requestAnimationFrame(GameLoop);
}

GameLoop();