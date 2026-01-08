const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

window.onload = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Pelaaja
const Hahmo = {
    stats: {Agility: 1, Strength: 1, Intelligence: 0, Endurance: 0, Luck: 0, Vitality: 0},
    status: {Stun: 0, Poison: 0, Burn: 0, Freeze: 0, Bleed: 0, Weakness: 0, Cold: 0, Vulnerability: 0, Curse: 0, Sickness: 0},
    ablity: {Dash: 0, Attack: 0, Beam: 0},
    buffs: {Haste: 0, Power: 0, Regeneration: 0, Fortitude: 0, Blessing: 0, Forcefield: 0},
    other: {level: 1, experience: 0, gold: 0},
    player: {Health: 100, Mana: 0, Stamina: 100, armor: 0, ammo: 0},
    position: {x: 0, y: 0, width: 50, height: 50}, // MUUTOS: worldX/worldY lasketaan tästä
    skin: {color: "blue"}
};

// Pelaaja-luokka MUUTETTU
class Pelaaja {
    constructor(Hahmo) {
        for (let key in Hahmo) {
            Object.assign(this, Hahmo[key]);
        }

        this.worldX = 50; // MUUTOS: alkuperäinen x
        this.worldY = 50; // MUUTOS: alkuperäinen y
    }

    draw(ctx) {
        // Pelaaja aina keskellä
        const x = canvas.width / 2 - this.position.width / 2;
        const y = canvas.height / 2 - this.position.height / 2;
        ctx.fillStyle = this.skin.color;
        ctx.fillRect(x, y, this.position.width, this.position.height);
    }

    Movement(keys) {
        if (keys["w"]) this.worldY -= this.stats.Agility;
        if (keys["s"]) this.worldY += this.stats.Agility;
        if (keys["a"]) this.worldX -= this.stats.Agility;
        if (keys["d"]) this.worldX += this.stats.Agility;
    }

    Attacks(keys) {
        if (keys["shift"]) {
            if (this.player.Stamina >= 20 && this.ablity.Dash === 0) {
                if (keys["w"]) this.worldY -= this.stats.Agility * 20;
                if (keys["s"]) this.worldY += this.stats.Agility * 20;
                if (keys["a"]) this.worldX -= this.stats.Agility * 20;
                if (keys["d"]) this.worldX += this.stats.Agility * 20;
                this.player.Stamina -= 20;
                this.ablity.Dash = 0.5;
            }
        }
    }
}

const pelaaja = new Pelaaja(Hahmo);

// Kamera = pelaajan world-koordinaatit
const camera = {
    x: 0,
    y: 0
};

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

function game() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pelaaja.Movement(keys);
    pelaaja.Attacks(keys);

    // MUUTOS: kamera seuraa pelaajaa
    camera.x = pelaaja.worldX;
    camera.y = pelaaja.worldY;

    // Pelaaja piirtyy keskelle
    pelaaja.draw(ctx);

    // MUUTOS: esimerkkivihollinen piirtyy world -> screen
    const vihollinen = {worldX: camera.x + 100, worldY: camera.y, size: 50, color: "red"};
    const enemyScreenX = vihollinen.worldX - camera.x + canvas.width / 2;
    const enemyScreenY = vihollinen.worldY - camera.y + canvas.height / 2;
    ctx.fillStyle = vihollinen.color;
    ctx.fillRect(enemyScreenX, enemyScreenY, vihollinen.size, vihollinen.size);

    requestAnimationFrame(game);
}

game();