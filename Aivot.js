export async function lataaKaikkiData() {

    const [screenSize, screenShape] = await Promise.all([
        fetch('Data/Ruutu/koko.json').then(res => res.json()),
        fetch('Data/Ruutu/muoto.json').then(res => res.json())
    ]);

    const [playerSize, playerShape, playerPosition] = await Promise.all([
        fetch('Data/Pelaaja/koko.json').then(res => res.json()),
        fetch('Data/Pelaaja/muoto.json').then(res => res.json()),
        fetch('Data/Pelaaja/koordinaatit.json').then(res => res.json())
    ]);

    return {
        screen: { size: screenSize, shape: screenShape },
        player: { size: playerSize, shape: playerShape, position: playerPosition }
    };
}