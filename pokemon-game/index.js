// selects our canvas from index.html, then get its context making it a 2D API that draws out everything we need for our game
// note, we can change 2d to 3d if we were making a 3D game
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

// Set our canvas width and height. This is a perfect 16-9 ratio 
// We can now call our c (canvas) in class.js in our draw functions (to draw out our canvas)
canvas.width = 1024
canvas.height = 576

// Takes the data from collisions.js and implements it to our map so players won't be able to go through walls and water
// instead of checking the whole collisions list (takes too long), we loop through each maps height which is from i to 70
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
	collisionsMap.push(collisions.slice(i, 70 + i))
}

// Takes the data from battleZones.js and implements it to our map so players will be able to go through dark grass to encounter a battle
// instead of checking the whole battleZonesData list (takes too long), we loop through each maps height which is from i to 70
const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
	battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

// create an empty boundary list to populate the collision points
const boundaries = []

// off set the screen so the map is in the correct position when player spawns
const offset = {
	x: -1312,
	y: -620
}

collisionsMap.forEach((row, i) => {			// loops inside of collisionsMap and when we encounter the data 1025, we push that into the list boundaries
	row.forEach((symbol, j) => {
		if (symbol === 1025)
			boundaries.push(
				new Boundary({				// calls Boundary class to draw the collision positions onto the offset map. Positioned using it as a grid
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y
					}
				})
			)
	})
})

// create and empty battleZone area list to populate the battle zone points
const battleZones = []

battleZonesMap.forEach((row, i) => {		// loops inside of battleZonesMap and when we encounter the data 1025, we push that into the list battleZones	
	row.forEach((symbol, j) => {
		if (symbol === 1025)
			battleZones.push(
				new Boundary({				// calls Boundary class to draw the battleZones positions onto the offset map. Positioned using it as a grid
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y
					}
				})
			)
	})
})

// Define a new variable to create a new image. This is specifically for our map image and basically let's the img load before it is called
const image = new Image()
image.src = './img/Pellet Town.png'

// Creates foreground image to load (images like buildings and trees so the player can walk udner without being seen)
const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'

// Create each specific player image when players move
const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

// Creates the player using class Sprite, positions the player in the middle and start in player down position
// frames to show player movement animation
// sprites contains all player movement images
const player = new Sprite({
	position: {
		x: canvas.width / 2 - 192 / 4 / 2, 
		y: canvas.height / 2 - 68 / 2
	},
	image: playerDownImage,
	frames: {
		max: 4,
		hold: 10
	},
	sprites: {
		up: playerUpImage,
		left: playerLeftImage,
		right: playerRightImage,
		down: playerDownImage
	}
})

// Background calls a new class Sprite to draw our map image
const background = new Sprite({
	position: {
		x: offset.x,
		y: offset.y
	},
	image: image
})

// foreground calls a new Sprite class to draw our trees and roofs so that players are able to walk behind it
const foreground = new Sprite({
	position: {
		x: offset.x,
		y: offset.y
	},
	image: foregroundImage
})

// sets all keys (w, a, s, d) to false until player presses down (keydown) onto that specific key
const keys = {
	w: {
		pressed: false
	},
	a: {
		pressed: false
	},
	s: {
		pressed: false
	},
	d: {
		pressed: false
	}
}

// creates an array called movables -> the array consist of the background, boundaries, foreground, and battlezones
// any array with '...' in front is taking all the items and place them directly within this array so 
// we're not having any 2D arrays happening
// this array takes our map, boundaries, foreground, and battlezones to move when the player is "moving"
const movables = [background, ...boundaries, foreground, ...battleZones]

//  This function checks if player is touching collision spot
// This is specifically creating a hitbox around the player (rectangle)
// and getting its position to see if the collision spot is touching the player in the right spots
function rectangularCollision({rectangle1, rectangle2}) {
	return (
		rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width && 
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y
	)
}

// as we start the game, we are not yet in battle, so we set battle initiated to false
const battle = {
	initiated: false
}

// creates function animate to animate player movement
// request for an animation frame
function animate() {
	const animationId = window.requestAnimationFrame(animate)
	background.draw()						// draws background map
	boundaries.forEach((boundary) => {
		boundary.draw()						// draws all the boundaries
	})
	battleZones.forEach((battleZone) => {
		battleZone.draw()					// draws all the battle zones
	})
	player.draw()							// draws player
	foreground.draw()						// draws foreground layer

	let moving = true						// moving is true because player is able to move from the start
	player.animate = false					// no movable keys pressed yet, so players do not need to be animated

	if (battle.initiated) return			// if battle sequence is initiated, end this part of the program

	// activate battle
	// check if player is pressing any movable key "w, a, s, d"
	// if they are, check if the battle zone is on that specific spot
	// check if the battlezone is the area the player is overlapping
	// call the rectangularCollision function to check if the players hitbox is touching the dark grass
	// then, randomize the chance of encountering a battle
	if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
		for (let i = 0; i < battleZones.length; i++) {
			const battleZone = battleZones[i]
			const overlappingArea = 
				(Math.min(
					player.position.x + player.width, 
					battleZone.position.x + battleZone.width
				) - 
					Math.max(player.position.x, battleZone.position.x)) *
				(Math.min(
					player.position.y + player.height, 
					battleZone.position.y + battleZone.height
				) - 
					Math.max(player.position.y, battleZone.position.y))
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: battleZone
				}) &&
				overlappingArea > (player.width * player.height) / 2 && 
				Math.random() < 0.01		// randomize chance of encountering a battle here
			) {

				// deactivate current animation loop
				window.cancelAnimationFrame(animationId)

				// where the battle starts, audio map stops
				// play the battle audio
				// and battle initiated is now true to let the program know we are in our battle sequence
				audio.Map.stop()
				audio.initBattle.play()
				audio.battle.play()
				battle.initiated = true
				gsap.to('#overlappingDiv', {		// we take the overlappingDiv, which is our black background in index.html and animate it using gsap
					opacity: 1,
					repeat: 3,
					yoyo: true,
					duration: 0.4,					// we show the black background that covers the screen, and make it go in and out like a yoyo, repeating 3 times for 4 seconds
					onComplete() {
						gsap.to('#overlappingDiv', {	// on complete, we animate the black background again to stay black for 4 seconds
							opacity: 1,
							duration: 0.4,
							onComplete() {				// on complete, we call initBattle and animateBattle to change the map to the battle map
								// activate a new animation loop
								initBattle()
								animateBattle()
								gsap.to('#overlappingDiv', {	// we then hide the black background (overlappingDiv)
									opacity: 0,
									duration: 0.4
								})
							}
						})
					}
				})
				// after the animation, we break out of the for loop
				break
			}
		}
	}

	// Now we check if player is trying to move using 'w', 'a', 's', or 'd' 
	// if player press a moving key, player animate is true
	// depending on what direction the player is going, player image will equal to the player image going that direction
	// for example, if w key is pressed, we take the image of the sprite going up
	if (keys.w.pressed && lastKey === 'w') {
		player.animate = true
		player.image = player.sprites.up 

		// Here we check the boundaries, if player is running into forbidden area, we check using rectangularCollision function
		// and if it's true, moving is now false, and we exit out the loop
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary, 
						position: {
							x: boundary.position.x,
							y: boundary.position.y + 3
						}
					}
				})
			) {
				moving = false
				break
			}
		}

		// if moving is still true, we move the movables (maps, battlezones, foreground, etc) to give the allusion that the player is moving
		if (moving)
			movables.forEach((movable) => {
				movable.position.y += 3
		})
	// then we do the same to the other keys that move the player 
	} else if (keys.a.pressed && lastKey === 'a') {
		player.animate = true
		player.image = player.sprites.left

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary, 
						position: {
							x: boundary.position.x + 3,
							y: boundary.position.y
						}
					}
				})
			) {
				moving = false
				break
			}
		}

		if (moving)
			movables.forEach((movable) => {
				movable.position.x += 3
		})
	} else if (keys.s.pressed && lastKey === 's') {
		player.animate = true
		player.image = player.sprites.down

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary, 
						position: {
							x: boundary.position.x,
							y: boundary.position.y - 3
						}
					}
				})
			) {
				moving = false
				break
			}
		}

		if (moving)
			movables.forEach((movable) => {
				movable.position.y -= 3
		})
	} else if (keys.d.pressed && lastKey === 'd') {
		player.animate = true
		player.image = player.sprites.right

		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary, 
						position: {
							x: boundary.position.x - 3,
							y: boundary.position.y
						}
					}
				})
			) {
				moving = false
				break
			}
		}

		if (moving)
			movables.forEach((movable) => {
				movable.position.x -= 3
		})
	}
}
// animate()

// we initially want lastKey to be constantly empty. When a key is pressed, it will set that key as pressed (keydown)
// then becomes empty again because if it isn't, it will infinitely make a key pressed true which results to a bug
let lastKey = ''

// listens for an event - keydown -> argument references an arrow function
// When a certain key is pressed (w,a,s,d) for moving, we set that key to true and also set it as the last key pressed, then break out of the switch
window.addEventListener('keydown', (e) => {
	switch (e.key) {
		case 'w':
			keys.w.pressed = true
			lastKey = 'w'
			break

		case 'a':
			keys.a.pressed = true
			lastKey = 'a'
			break

		case 's':
			keys.s.pressed = true
			lastKey = 's'
			break

		case 'd':
			keys.d.pressed = true
			lastKey = 'd'
			break
	}
})

// once you let go of pressing a key, all key press will turn to false
// this will remove any bugs keeping the player to move one direction even when you let go of that specific key
window.addEventListener('keyup', (e) => {
	switch (e.key) {
		case 'w':
			keys.w.pressed = false
			break

		case 'a':
			keys.a.pressed = false
			break

		case 's':
			keys.s.pressed = false
			break

		case 'd':
			keys.d.pressed = false
			break
	}
})

// to start the map audio when game first starts, you have to click on the screen anywhere, and the audio will start playing
let clicked = false
addEventListener('click', () => {
	if (!clicked) {
		audio.Map.play()
		clicked = true
	}
})