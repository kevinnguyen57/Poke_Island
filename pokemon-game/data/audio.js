// create a constant variable called audio, and store all audio files from the audio folder
// we add each audio one by one using 'new Howl' from the audio library script we added to our html file 
const audio = {
	Map: new Howl({
		src: './audio/map.wav',
		html5: true, // we don't have a local server so we need to set html5 to true to play the audio
		volume: 0.1  // we can also set the volume of the audio so it's not too loud or too quiet
	}),
	initBattle: new Howl({
		src: './audio/initBattle.wav',
		html5: true,
		volume: 0.1
	}),
	battle: new Howl({
		src: './audio/battle.mp3',
		html5: true,
		volume: 0.1
	}),
	tackleHit: new Howl({
		src: './audio/tackleHit.wav',
		html5: true,
		volume: 0.1
	}),
	fireballHit: new Howl({
		src: './audio/fireballHit.wav',
		html5: true,
		volume: 0.1
	}),
	initFireball: new Howl({
		src: './audio/initFireball.wav',
		html5: true,
		volume: 0.1
	}),
	victory: new Howl({
		src: './audio/victory.wav',
		html5: true,
		volume: 0.1
	})
}