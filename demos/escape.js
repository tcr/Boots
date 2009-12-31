Light = Structure.extend({
	centerx: 0,
	centery: 0,
	
	constructor: function (slot) {
		this.ampx = rand(300)
		this.ampy = rand(300)
		this.anglex = rand(360)
		this.angley = rand(360)
		this.originx = rand(600)
		this.originy = 50 + rand(500)
		this.centerx = this.originx + this.ampx * Math.sin(Math.PI*this.anglex/180);
		this.centerx = this.originx + this.ampx * Math.sin(Math.PI*this.anglex/180);
		slot.append(
			this.circ = oval(this.centerx, this.centery, 150, {center: true, fill: rgb(255, 255, 0, 255*.7), stroke: null})
		)
		console.log(this.circ.elem);
		this.dx = 1 + rand(2)
	},
	
	move: function () {
		this.anglex += this.dx
		this.angley += 1
		this.centerx = this.originx + this.ampx + Math.sin(Math.PI*this.anglex/180)
		this.centery = this.originy + this.ampy + Math.sin(Math.PI*this.angley/180)
		this.circ.move(this.centerx, this.centery)
	}
})

width = 600
height = 600

MAN_X = width/2
MAN_Y = 590

function game_start() {
	if (clear) {
		stage += 1
		times(3, function () {
			lights.push(new Light(light_slot))
		})
	}
	man.move(MAN_X, MAN_Y)
	text.replace('Start #', stage);
	text.show()
	clear = false
	failed = false
	start = true
}

function game_clear() {
	text.replace('Escaped')
	clear = true
}

function game_failed() {
	text.replace('You are detected.')
	failed = true
}

stage = 0
clear = true

lights = []

Boots.app({width: width, height: height},
	background(black),
	light_slot = stack(),
	
	line(0, 15, width, 15, {fill: null, stroke: red}),
	
	rect(width/2, height - 10, 40, 20, {center: true, fill: '#333', stroke: null}),
	
	man = rect(MAN_X, MAN_Y, 10, 10, {center: true, fill: blue, stroke: null}),
	
	text = para('Start', {stroke: red, align: 'center', size: 26, top: height/2 - 42}),
	
	function motion(left, top) {
		if (clear || failed)
			return
		if (Math.abs(man.left() - left) <= 30 && Math.abs(man.top() - top) <= 30) {
			if (start) {
				start = false
				text.replace('')
			}
			man.move(left, top)
			if (man.top() <= 5)
				game_clear()
		}
	},
	
	function click(button, x, y) {
		if (clear || failed)
			game_start()
	}
)

game_start()

animate(60, function () {
	each(lights, function (light) {
		light.move()
	})
	if (start || clear || (man.left() >= width/2 - 20 && man.left() <= width/2 + 10 && man.top() >= height - 20))
		return
	each(lights, function (light) {
		if (Math.sqrt(Math.pow(light.centerx - (man.left() + 5), 2) + Math.pow(light.centery - (man.top() + 5), 2)) <= 80)
			game_failed()
	})
})