// ================= DATA INPUT SECTION =================

import { lataaKaikkiData } from './Aivot.js';

// ================= DATA USAGE SECTION =================

async function init() {
    const data = await lataaKaikkiData();
    
    const canvas = document.getElementById("TestArea");
    const ctx = canvas.getContext("2d");

    // Peli-ikkuna
    if (data.screen.size.useWindowSize) {
        canvas.width = window.innerWidth || data.screen.size.defaultWidth;
        canvas.height = window.innerHeight || data.screen.size.defaultHeight;
    } else {
        canvas.width = data.screen.size.defaultWidth;
        canvas.height = data.screen.size.defaultHeight;
    }
    canvas.style.backgroundColor = data.screen.shape.backgroundColor;

    // Pelaaja
    ctx.fillStyle = data.player.shape.color;
    const size = data.player.size.width;
    ctx.fillRect(canvas.width / 2 - size / 2, canvas.height / 2 - size / 2, size, size);
}

init();