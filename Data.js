export let Data = {
    Ruutu: {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "black"
    },

    Pelaaja: {

        Spawn: {
            x: 0,
            y: 0,
        },

        Appearance: {
            color: "white",
            size: 20
        },
        
        Stats: {
            Strenght: 0,
            Endurance: 0,
            Intelligence: 0,
            Agility: 0,
            Vitality: 0,
            Luck: 0
        },

        Ablities: {

            Dash: {
                Cooldown: 1000,
                Duration: 100
            },

            Shoot: {
                Appearance: {
                    color: "cyan"
                }
            },

            Stomp: {
                Appearance: {
                    color: "red"
                }
            }
        },
    },

    Viholliset_Type: {
        Perus: {color: "blue", size: 20, speed: 1, Tier: 0}
    },

    Viholliset: []
};