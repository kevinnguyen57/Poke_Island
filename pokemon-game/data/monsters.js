
// We store our monster data in a constant variable called monsters
// if we want to add more monsters to our game, we define them here
const monsters = {
	Emby: {
		position: {		// determine their position here (for battle)
			x: 285,
			y: 330
		},
		image: {		// Link them to their img sprite 
			src: './img/embySprite.png'
		},
		frames: {
			max: 4,		// set their frames to animate them
			hold: 30
		},
		animate: true,
		name: 'Emby',	// name them, and populate their unique attacks
		attacks: [attacks.Tackle, attacks.Fireball]	
	},
	Draggle: {
		position: {
			x: 800,
			y: 100
		},
		image: {
			src: './img/draggleSprite.png'
		},
		frames: {
			max: 4,
			hold: 30
		},
		animate: true,
		isEnemy: true,
		name: 'Draggle',
		attacks: [attacks.Tackle, attacks.Fireball]
	}
}