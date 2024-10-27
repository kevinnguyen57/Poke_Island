const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
	document.querySelector('#userInterface').style.display = 'block' // shows battle interface 
	document.querySelector('#dialogueBox').style.display = 'none'    // shows dialogue box 
	document.querySelector('#enemyHealthBar').style.width = '100%'   // shows health bar of enemy (always at 100% when battle first initiates)
	document.querySelector('#playerHealthBar').style.width = '100%'	 // shows player health bar (always at 100% when battle first initiates)
	document.querySelector('#attacksBox').replaceChildren()			 // repopulate attack choices, if not repopulated, will double choices which is a bug


	draggle = new Monster(monsters.Draggle)
	emby = new Monster(monsters.Emby)
	renderedSprites = [draggle, emby]
	queue = []

	emby.attacks.forEach(attack => {
		const button = document.createElement('button')
		button.innerHTML = attack.name
		document.querySelector('#attacksBox').append(button)
	})

	// our event listeners for our buttons (attack)
	document.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', (e) => {
			const selectedAttack = attacks[e.currentTarget.innerHTML]
			// emby attacks first (order is important here)
			emby.attack({ 
				attack: selectedAttack,
				recipient: draggle,
				renderedSprites
			})

			// when draggle's health is equal to or less than 0, push the faint function in the queue so draggle will faint and end the battle
			// the faint function is defined in class Monsters
			if (draggle.health <= 0) {
				queue.push(() => {
					draggle.faint()
				})
				// if Draggle faints, we push the next queue which will animate the screen to transition back to the map
				queue.push(() => {
					//fade back to black using gsap
					gsap.to('#overlappingDiv', {
						opacity: 1,
						onComplete: () => {
							// on completion, cancel the battle animation, and call animate() to animate the map again
							cancelAnimationFrame(battleAnimationId)
							animate()
							// document hides the user interface (ex: health bars and dialogues)
							document.querySelector('#userInterface').style.display = 'none'

							gsap.to('#overlappingDiv', {
								// makes the black transition div disappear with opacity of 0
								opacity: 0
							})
							// battle sequence is now false as we return back to the map for players to move
							 battle.initiated = false
							 audio.Map.play()
						}
					})
				})
			}

			// draggle or enemy attacks right here
			const randomAttack = 
				draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

			// draggle's attack is queued next after emby attacks
			queue.push(() => {
				draggle.attack({
					attack: randomAttack,
					recipient: emby,
					renderedSprites
				})

				// we put this code in after enemy attacks to follow the right order. After enemy attacks and player monsters health is 0
				// player monster faints
				// when emby's health is equal to or less than 0, push the faint function in the queue so emby will faint and end the battle
				// the faint function is defined in class Monsters
				if (emby.health <= 0) {
				queue.push(() => {
					emby.faint()
				})
				queue.push(() => {
					//fade back to black
					gsap.to('#overlappingDiv', {
						opacity: 1,
						onComplete: () => {
							cancelAnimationFrame(battleAnimationId)
							animate()
							document.querySelector('#userInterface').style.display = 'none'

							gsap.to('#overlappingDiv', {
								opacity: 0
							})

							battle.initiated = false

							// when you exit out of battle, the audo goes back to the map audio
							audio.Map.play()
						}
					})
				})
			}
			})

		})

		button.addEventListener('mouseenter', (e) => {
			const selectedAttack = attacks[e.currentTarget.innerHTML]
			document.querySelector('#attackType').innerHTML = selectedAttack.type
			document.querySelector('#attackType').style.color = selectedAttack.color
		})
	})
}

// creates animateBattle function
// sets the variable battleAnimationId to request animation frame 'animateBattle' which will load the battle background and draw it to the canvas
// we then render the msprites (monsters) and draw them on the screen
function animateBattle() {
	battleAnimationId = window.requestAnimationFrame(animateBattle)
	battleBackground.draw()

	renderedSprites.forEach((sprite) => {
		sprite.draw()
	})
}

// after the battle sequence is over, we call animate to go back to the main map
animate()

// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
	if (queue.length > 0) { // we have items in our queue to be called
		queue[0]() 			// Selects our queue and gets the first item in it calling draggle to attack
		queue.shift()		// deletes the item in the queue
	} else e.currentTarget.style.display = 'none'
})