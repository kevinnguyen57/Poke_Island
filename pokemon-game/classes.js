
// create class called Sprite
// we set its constructor -> whenever creating a new instance of a sprite, call whatever code in constructor 
class Sprite {
	constructor({ 
		position, 
		velocity,
		image, 
		frames = { max: 1, hold: 10 }, 	// holds frames for animation on specific sprites
		sprites, 
		animate = false,
		rotation = 0
	}) {
		this.position = position
		this.image = new Image()
		this.frames = {...frames, val: 0, elapsed: 0}
		this.image.onload = () => {
			// crop width and height, split in 4's because there are 4 sprite animations for each img
			// if we look back at index.js where const player is defined, we see that frames is max: 4
			this.width = this.image.width / this.frames.max
			this.height = this.image.height
		}
		this.image.src = image.src

		this.animate = animate
		this.sprites = sprites
		this.opacity = 1

		this.rotation = rotation
	}

	// draws the sprite to the screen
	draw() {
		// saves the sprite, translates it to rotate it one way and rotate it back
		// we rotate it for an animation but we need to set it back
		c.save()
		c.translate(
			this.position.x + this.width / 2, 
			this.position.y + this.height / 2
		)
		c.rotate(this.rotation)
		c.translate(
			-this.position.x - this.width / 2, 
			-this.position.y - this.height / 2
		)
		c.globalAlpha = this.opacity
		c.drawImage(
			this.image,
			this.frames.val * this.width,
			0,
			this.image.width / this.frames.max,
			this.image.height,
			this.position.x,
			this.position.y,
			this.image.width / this.frames.max,
			this.image.height
		)
		// restores from save to it's orignal
		c.restore()

		// if animate is not true, get out of this function
		if (!this.animate) return

		// increment frames elapsed to animate each frame correctly
		if (this.frames.max > 1) {
			this.frames.elapsed++
		}

		// when frames elapsed mod frames hold is equal to 0, meaning elapsed counted up to 10 (hold = 10 deault for 10 seconds)
		// change the frame val to go to the next only if the val < max frames
		// if the val is at the max frames, we need to start back at the first frame to continue the cycle animation
		if (this.frames.elapsed % this.frames.hold === 0) {
			if (this.frames.val < this.frames.max - 1) this.frames.val++
			else this.frames.val = 0
		}
	}
}

// extends our class Sprite above, gives us all the methods available within that class
// such as draw and attack and create a new class called Monster for our monster sprites
class Monster extends Sprite {
	constructor({
		position,
		velocity, 
		image, 
		frames = { max: 1, hold: 10 }, 	// holds frames for animation on specific sprites
		sprites, 
		animate = false,
		rotation = 0,
		isEnemy = false,
		name,
		attacks
	}) {
		super({
			position, 
			velocity,
			image, 
			frames,
			sprites, 
			animate,
			rotation
		})	// we add more defined variables for battle interface
		this.health = 100
		this.isEnemy = isEnemy
		this.name = name
		this.attacks = attacks
	}

	// where our function animate is created!
	faint() {
		document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!' // this will show specific monster has fainted in the dialogue box
		gsap.to(this.position, {
			y: this.position.y + 20		// when monster faints, y position changes to + 20 which drops the monster downwards
		})
		gsap.to(this, {
			opacity: 0 		// then animates the fainted monster using gsap, and opacity fades to 0  (disappears)
		})
		// audio battle stops, and victory audio plays when the enemy faints
		audio.battle.stop()
		audio.victory.play()
	}

	// now when a attack is used, attack is called to display a dialogue box and calcualte health bar update and attack animation
	attack({attack, recipient, renderedSprites }) {
		// targets the id from html using # and then outputting '[sprite name] used [attack name]' to the dialogue box
		document.querySelector('#dialogueBox').style.display = 'block'
		document.querySelector('#dialogueBox').innerHTML = 
			this.name + ' used ' + attack.name

		// set the healthbar of which ever monster getting attacked
		let healthbar = '#enemyHealthBar'
		if (this.isEnemy) healthbar = '#playerHealthBar'

		// animate the rotation of the monster getting hit
		let rotation = 1
		if (this.isEnemy) rotation = -2.2

		// calculate the healthbar of monster that was atatcked by checking the attack damage used
		recipient.health -= attack.damage

		switch (attack.name) {
			case 'Fireball':
				audio.initFireball.play()
				const fireballImage = new Image()
				fireballImage.src = './img/fireball.png'
				const fireball = new Sprite({
					position: {
						x: this.position.x,
						y: this.position.y
					},
					image: fireballImage,
					frames: {
						max: 4,
						hold: 10
					},
					animate: true,
					rotation
				})
				renderedSprites.splice(1, 0, fireball)

				gsap.to(fireball.position, {
					x: recipient.position.x,
					y: recipient.position.y,
					onComplete: () => {
						// Enemy actually gets hit
						// play fireball hit audio 
						audio.fireballHit.play()
						gsap.to(healthbar, {
							width: recipient.health + '%'
						})

						gsap.to(recipient.position, {
							x: recipient.position.x + 10,
							yoyo: true,
							repeat: 5,
							duration: 0.08
						})

						gsap.to(recipient, {
							opacity: 0,
							repeat: 5,
							yoyo: true,
							duration: 0.08
						})
						renderedSprites.splice(1, 1)
					}
				})

				break
			case 'Tackle':
				const tl = gsap.timeline()

				let movementDistance = 20
				if (this.isEnemy) movementDistance = -20

				tl.to(this.position, {
					x: this.position.x - movementDistance
				}).to(this.position, {
					x: this.position.x + movementDistance * 2,
					duration: 0.1,
					onComplete: () => {
						// Enemy actually gets hit
						audio.tackleHit.play()
						gsap.to(healthbar, {
							width: recipient.health + '%'
						})

						gsap.to(recipient.position, {
							x: recipient.position.x + 10,
							yoyo: true,
							repeat: 5,
							duration: 0.08
						})

						gsap.to(recipient, {
							opacity: 0,
							repeat: 5,
							yoyo: true,
							duration: 0.08
						})
					}
				}).to(this.position, {
					x: this.position.x
				})
			break
		}
	}

}

// we create a class Boundary to set the collision and battle zone areas 
class Boundary {
	static width = 48
	static height = 48
	constructor({position}) {
		this.position = position
		this.width = 48
		this.height = 48
	}

	// we call draw() and use c (which is our canvas we defined in index.js) to set our game boundaries 
	// we used fill style to check if our boundaries are in the correct spot (testing code)
	// if we were to change rgba's last 0 to .5, we'll be able to see the positions the boundaries are at
	draw() {
		c.fillStyle = 'rgba(255, 0, 0, 0)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}