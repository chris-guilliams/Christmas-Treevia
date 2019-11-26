module.exports = {
	generateJSON: (twinkly) => {
		const frames = [];
		const totalLights = 225;

		for (let x =0; x < totalLights; x++) {
			frames.push(twinkly.generateFullFrame({r: 0, g:244, b: 0}, 175));
			for (let y = 0; y <= x ; y++) {
				frames[x][y].r = 244;
				frames[x][y].g = 0;
			}
		}

		for (let x =0; x < totalLights; x++) {
			frames.push(twinkly.generateFullFrame({r: 244, g:0, b: 0}, 175));
			for (let y = 0; y <= x ; y++) {
				frames[x + totalLights][y].r = 0;
				frames[x + totalLights][y].g = 244;
			}
		}
		return frames;
	},
	generateSolidColorJSON: (twinkly, red, green, blue) => {
		const frames = [];
		const totalLights = 225;

		for (let x = 0; x < totalLights; x++) {
			frames.push(twinkly.generateFullFrame({r: red, g: green, b: blue}, 50));
		}

		return frames;
	},
	generateRandomColorJSON: (twinkly, red, green, blue) => {
		const frames = [];
		const totalLights = 225;

		for (let x = 0; x < totalLights; x++) {
			frames.push(twinkly.generateFullFrame({r: red, g: green, b: blue}, 50));
		}

		return frames;
	}
}