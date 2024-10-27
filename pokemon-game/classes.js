
// create class called Sprite
// we set its constructor -> whenever creating a new instance of a sprite, call whatever code in constructor 
class Sprite {
	constructor({ 
		position, 
		velocity,
		image, 
		frames = { max: 1, hold: 10 }, 
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

	draw() {
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
		c.restore()

		if (!this.animate) return

		if (this.frames.max > 1) {
			this.frames.elapsed++
		}

		if (this.frames.elapsed % this.frames.hold === 0) {
			if (this.frames.val < this.frames.max - 1) this.frames.val++
			else this.frames.val = 0
		}
	}
}

// extends our class Sprite above, gives us all the methods available within that class
// such as draw and attack
class Monster extends Sprite {
	constructor({
		position,
		velocity, 
		image, 
		frames = { max: 1, hold: 10 }, 
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
		})
		this.health = 100
		this.isEnemy = isEnemy
		this.name = name
		this.attacks = attacks
	}

	// where out function animate is created!
	faint() {
		document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!' // this will show specific monster has fainted in the dialogue box
		gsap.to(this.position, {
			y: this.position.y + 20		// when monster faints, y position changes to + 20 which drops the monster downwards
		})
		gsap.to(this, {
			opacity: 0 		// then animates the fainted monster using gsap, and opacity fades to 0  (disapears)
		})
		// audio battle stops, and victory audio plays
		audio.battle.stop()
		audio.victory.play()
	}

	attack({attack, recipient, renderedSprites }) {
		document.querySelector('#dialogueBox').style.display = 'block'
		document.querySelector('#dialogueBox').innerHTML = 
			this.name + ' used ' + attack.name

		let healthbar = '#enemyHealthBar'
		if (this.isEnemy) healthbar = '#playerHealthBar'

		let rotation = 1
		if (this.isEnemy) rotation = -2.2

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

class Boundary {
	static width = 48
	static height = 48
	constructor({position}) {
		this.position = position
		this.width = 48
		this.height = 48
	}

	// we call draw() and use c (which is our canvas we defined in index.js) to set our game boundaries 
	draw() {
		c.fillStyle = 'rgba(255, 0, 0, 0)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}