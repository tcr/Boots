// The Game of Life
// This code is released into the Public Domain
// Revision 4-with-fades
// jashkenas@gmail.com

// This edit includes fading of cells between generations, just for visuals.
// kevinc, connerk@gmail.com

clicking = false
paused = false

Life = {
	CRITTERS_TO_START_WITH: 100, // The amount of critters to make if you seed.
	// WIDTH and HEIGHT are counted in critters
	WIDTH: 35, 
	HEIGHT: 25,
	UNIT: 24, // The dimensions of a single critter
	PIXEL_WIDTH: (24) * (35), // UNIT * WIDTH
	PIXEL_HEIGHT: (24) * (25), // UNIT * HEIGHT
	CONTROLS_HEIGHT: 50,
	
	speed: 25,
	time_between_frames: 0.0, //0.0 to 1.0 linearly, loop each frame
	fade_period: 0.40, //fade during the first __% of the time between frames
	fade_interpolant: 0.0, //0.0 to 1.0 on an s-curve
	
	// Iterator for each critter
	each: function (callback) {
		times(Life.WIDTH, function (x) {
			times(Life.HEIGHT, function (y) {
				callback(x, y)
			})
		})
	},
	
	set_speed: function (speed_factor) {
		if (paused)
			paused = Math.round(speed_factor * 50 + 1)
		else
			Life.speed = Math.round(speed_factor * 50 + 1)
	}, 
	
	// Let's us change speed without messing with the animate loop.
	maybe_update: function (counter) {
		if (counter % Life.speed == 0 && Life.speed < 100) {
			Life.set_time_between_frames(0.0)
			GoldenPlain.armageddon_and_resurrection()
		} else {
			Life.set_time_between_frames(Life.time_between_frames + 1.0 / Life.speed)
			GoldenPlain.draw()
		}
	}, 
	
	set_time_between_frames: function (time) {
		Life.time_between_frames = Math.min(time, Life.fade_period)
		// scale the low-to-high half of a cosine curve and fit that between 0 and 1.
		//  factoring this into critter opacity makes for a smooth fade between two generations.
		Life.fade_interpolant = (1 - Math.cos(Life.time_between_frames * Math.PI / Life.fade_period)) / 2
	},
  
	pause: function () {
		if (paused) {
			Life.speed = paused
			paused = null
			GoldenPlain.background_text = null
		} else {
			paused = Life.speed
			Life.speed = 100
			GoldenPlain.background_text = "Paused"
		}
		GoldenPlain.draw()
	},
  
	// Delegate clicks to the GoldenPlain or to the Slider, as necessary
	click: function (button, x, y) {
		//if (button == 1)
			if (y < Life.PIXEL_HEIGHT) {
				clicking = true
				GoldenPlain.click(x, y, true)
			} else
				ControlPanel.start_slide(x, y)
	}, 
	
	motion: function (x, y) {
		if (clicking)
			GoldenPlain.click(x, y, false)
		ControlPanel.maybe_motion(x, y)
	},
	
	release: function (button,x,y) {
		//if (button == 1) {
			clicking = false
			ControlPanel.end_slide()
		//}
	}
}

GoldenPlain = {
	background_text: '',
	plain: null,
	
	reset: function () {
		critters = GoldenPlain.fresh_array()
		previous_critters = GoldenPlain.fresh_array()
		if (!GoldenPlain.plain)
			$app.append(GoldenPlain.plain = flow({margin: 0, top: 0, left:0, width: Life.PIXEL_WIDTH, height: Life.PIXEL_HEIGHT + 10}))
		GoldenPlain.plain.clear()
		GoldenPlain.draw()
	},
	
	fresh_array: function () {
		var arr = new Array(Life.WIDTH)
		times(Life.WIDTH, function (x) {
			arr[x] = new Array(Life.HEIGHT)
		})
		return arr
	},
	
	seed_randomly: function () {
		GoldenPlain.reset()
		times(Life.CRITTERS_TO_START_WITH, function () {
			var x = rand(Life.WIDTH), y = rand(Life.HEIGHT)
			critters[x][y] = new Critter(x, y)
		})
		GoldenPlain.draw()
	},
	
	draw: function () {
var oldPlain = GoldenPlain.plain;
GoldenPlain.plain = flow({margin: 0, top: 0, left:0, width: Life.PIXEL_WIDTH, height: Life.PIXEL_HEIGHT + 10});
//		GoldenPlain.plain.clear()
		if (GoldenPlain.background_text)
			GoldenPlain.plain.append(
				para(GoldenPlain.background_text, {stroke: rgb(255*0.1, 255*0.1, 255*0.3), top: 177, left: 107, font: '180px'})
			)
		Life.each(function (x, y) {
			if (critters[x][y] && previous_critters[x][y])
				critters[x][y].draw()
			else if (critters[x][y])
				critters[x][y].draw(Life.fade_interpolant)
			else if (previous_critters[x][y])
				previous_critters[x][y].draw(1.0 - Life.fade_interpolant)
		})
oldPlain.after(GoldenPlain.plain);
oldPlain.remove();
	},
	
	// Makes it easier to draw critters than it is to erase them.
	click: function (x, y, new_click) {
		var x = Math.round(x/Life.UNIT), y = Math.round(y/Life.UNIT)
		if (x >= 0 && x < Life.WIDTH && y >= 0 && y < Life.HEIGHT)
			if (critters[x][y])
				if (new_click)
					critters[x][y] = null
			else
				critters[x][y] = new Critter(x, y)
		GoldenPlain.draw()
	}, 
	
	// Check all surrounding squares, and add up the head count.
	has_neighbor: function (x, y) {
		var sum = 0
		each(range(-1, 1), function (x_around) {
			each(range(-1, 1), function (y_around) {
				var test_x = x + x_around, test_y = y + y_around
				if (test_x >= 0 && test_x < Life.WIDTH && test_y >= 0 && test_y < Life.HEIGHT)
					if (!(x_around == 0 && y_around == 0))
						if (critters[test_x][test_y])
							sum += 1
			})
		})
		return sum
	}, 
	
	// Rules of life and death.
	alive: function (x, y, sum) {
		return (sum == 3) || (sum == 2 && critters[x][y])
	},
	
	// Make a new generation of critters
	armageddon_and_resurrection: function () {
		var afterlife = GoldenPlain.fresh_array()
		Life.each(function (x, y) {
			var sum = GoldenPlain.has_neighbor(x, y)
			if (GoldenPlain.alive(x, y, sum))
				afterlife[x][y] = new Critter(x, y)
		})
		previous_critters = critters
		critters = afterlife
		GoldenPlain.draw()
	}
}

Critter = new Class({
	constructor: function (x, y) {
		this.x = x, this.y = y
		this.bonus_blueness = Math.random() * 0.6
	},
	
	draw: function (opacity) {
		opacity = arguments.length ? opacity : 1.0
		GoldenPlain.plain.append(
			oval({x: this.x*Life.UNIT, y: this.y*Life.UNIT, width: Life.UNIT-1, height: Life.UNIT-1,
			  stroke: gray(1.0, 0.6*opacity), fill:rgb(0.2, 0.2, 0.4 + this.bonus_blueness, 0.45 * opacity)})
		)
	}
})

ControlPanel = {
	sliding: false,
	slider: null,
	
	// Setup the controls - they will not be redrawn.
	setup: function () {
		$app.append(
			rect({left: 0, top: Life.PIXEL_HEIGHT, width: Life.PIXEL_WIDTH, height: Life.CONTROLS_HEIGHT, fill: gray(.1)}),
			flow({margin_top: 4, margin_left: 15, top: Life.PIXEL_HEIGHT + 10, left: 0},
				button('Clear', {width: 85}, function click() {
					Life.set_time_between_frames(0.0)
					GoldenPlain.reset()
				}),
				button('Seed', {margin_left: 10, width: 85}, function click() {
					Life.set_time_between_frames(0.0)
					GoldenPlain.seed_randomly()
				}),
				button('Pause', {margin_left: 10, width: 85}, function click() {
					Life.pause()
				})
			)
		)
		ControlPanel.slider = new Slider()
	},
	
	start_slide: function (x, y) {
		if (ControlPanel.slider.contains(x, y))
			ControlPanel.sliding = true
	},
	
	// Make sure to only change the speed if you actually clicked on the slider.
	maybe_motion: function (x, y) {
		if (ControlPanel.sliding) {
			ControlPanel.slider.move_to(x, y)
			Life.set_speed(ControlPanel.slider.get_percentage)
		}
	}, 
	
	end_slide: function () {
		ControlPanel.sliding = false
	}
}

Slider = new Class({
	x: 525,
	y: Life.PIXEL_HEIGHT + 19,
	dimensions: 15,
	slider: null,
	
	constructor: function () {
		$app.append(
			para('Speed:', {stroke: gray(0.95), font: '14px', left: Slider.LEFT_END - 65, top: this.y - 5}),
			rect({left: Slider.LEFT_END, top: this.y + 5, width: Slider.RIGHT_END - Slider.LEFT_END, height: 5}),
			this.slider = oval({x: this.x, y: this.y, radius: this.dimensions/2, fill: gray(0.8, 0.7), stroke: gray(1.0, 0.8), strokewidth: 3})
		)
	},
	
	// Check for clicks on the slider knob.
	contains: function (x,y) {
		return ((x >= this.x) && (x <= this.x + this.dimensions)) && ((y >= this.y) && (y <= this.y + this.dimensions))
	},
	
	move_to: function (x, y) {
		if (x >= Slider.LEFT_END && x <= Slider.RIGHT_END) {
			this.x = x - (this.dimensions/2)
			this.slider.move(this.x, this.y)
		}
	},
	
	get_percentage: function () {
		return 1 - (this.x - Slider.LEFT_END) / (Slider.RIGHT_END - Slider.LEFT_END);
	}
}, {
	LEFT_END: 375,
	RIGHT_END: 805
})

$app = Boots.app({width: Life.PIXEL_WIDTH, height: Life.PIXEL_HEIGHT + Life.CONTROLS_HEIGHT,
  resizable: false, title: 'The Game of Life'},
	background(rgb(.05, .05, .2)),
	
	function click(button, x, y) {
		Life.click(button, x, y)
	},
	
	function motion(x, y) {
		Life.motion(x, y)
	},
	
	function release(button, x, y) {
		Life.release(button, x,y)
	}
)

counter = 0
GoldenPlain.reset()
ControlPanel.setup()

animate(30, function () {
	counter += 1
	Life.maybe_update(counter)
})