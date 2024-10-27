
// atcack.js stores all attack data
// if we want to add more attacks, we add it here. This would allow more move sets for monsters
const attacks = {
	Tackle: {
		name: 'Tackle',
		damage: 10,
		type: 'Normal',	// set the specific type
		color: 'black'	// give it a type color, so when we hover over a move, it would show the type in color. 
	},
	Fireball: {
		name: 'Fireball',
		damage: 25,
		type: 'Fire',
		color: 'red'
	}
}