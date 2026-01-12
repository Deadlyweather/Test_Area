import { Data } from './Data.js';

// Canvas tarvikkeet (En vielä varma miksi tämä kohta on niin tärkeä)
const canvas = document.getElementById("TestArea");
const ctx = canvas.getContext("2d");

// Varmistus palikka (En ymmärrä miksi tämä on pakollinen kun Data.js kerää jo leveyden ja pituuden. Jos se edes toimii)
canvas.width = Data.Ruutu.width;
canvas.height = Data.Ruutu.height;

function draw() {

    // Tausta (Tämä toimii vain tausta kuvana)
    ctx.fillStyle = Data.Ruutu.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pelaaja (Tämän ei oikeasti kuuluisi liikkua vaan maasto liikkuu kun pelaaja "Liikkuu". Paitsi jos haluan että kamera siirtyy kursorin käytöllä)
    ctx.fillStyle = Data.Pelaaja.color;
    ctx.fillRect(
        Data.Pelaaja.x - Data.Pelaaja.size / 2,
        Data.Pelaaja.y - Data.Pelaaja.size / 2,
        Data.Pelaaja.size,
        Data.Pelaaja.size
    );

    // Viholliset (Jotain tekemistä pelaajalle)
    
    // Rakennukset (Antaa enemmän elämää tyhjyyteen)

    // Resurssit (Addiktiivinen konsepti)
}

draw();

