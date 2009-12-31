// A timer applications
// uzimonkey@gmail.com

// A button that toggles between two buttons

ToggleButton = Structure.extend({
	constructor: function (box, width, bef, b1, b2) {
		$box = box
		$width = width
		$bef = bef
		$b = [b1, b2]
		
		toggle = this
		$click_proc = function () {
			$b[0][1]()
			toggle.switch_buttons()
		}
		
		this.make_button()
	},
	
	switch_buttons: function () {
		$cb.remove()
		$b.reverse()
		this.make_button()
	},
	
	make_button: function () {
		$box.before($bef,
			$cb = button($b[0][0], {width: $width}, function click() { $click_proc(); })
		)
	}
})

$paused = false

function update_time() {
	if (!$paused)
		$seconds = Time.now() - $time
}

function display_time() {
	seconds = 0;
	each($times.concat([$seconds]), function (n) { seconds += n })
	
	$display.clear(
		title('%02d:%02d:%02d'.sprintf(
			seconds / (60*60),
			seconds / 60 % 60,
			seconds % 60
		), {stroke: $paused ? gray : white})
	)
}

function reset() {
	$seconds = 0
	$time = Time.now()
	$times = []
}

Boots.app({width: 200, height: 120, resizable: false},
	background({fill: gradient('#222', '#aaa')}),
	
	$display = stack({margin: 10}),
	
	$box = flow(
		$reset = button('Reset', {width: '50%'}, function click() {
			reset()
			display_time()
		})
	)
)	

reset()
display_time()

animate(60, function () {
	update_time()
	display_time()
})

new ToggleButton($box, '50%', $reset,
	['Pause', function () {
		update_time()
		$times.push($seconds)
		$seconds = 0
		
		$paused = true
		display_time()
	}],
	['Unpause', function () {
		$time = Time.now()
		$paused = false
		display_time()
	}]
)