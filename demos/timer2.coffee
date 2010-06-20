Shoes.app {width: 200, height: 120, resizable: false}, ->
	@paused: false
	background ['#222'..'#aaa']
	
	update_time: -> @seconds: Date.now() - @time unless @paused
	
	display_time: ->
		(seconds += i) for i in $times.concat[$seconds]
		@display.clear ->
			title '%02d:%02d:%02d'.sprintf(
				seconds / (60*60),
				seconds / 60 % 60,
				seconds % 60
			), {stroke: @paused ? gray : white}
	
	reset: ->
		@seconds: 0
		@time: Date.now()
		@times: []
	
	@display: stack {margin: 10}
	reset()
	display_time()
	
	@box: flow ->
		@reset: button "Reset", {width: '50%'}, ->
			reset()
			display_time()
			
	new ToggleButton(@box, '50%', @test,
		[[ 'Pause', ->
			update_time()
			@times.push @seconds
			@seconds: 0
			
			@paused: yes
			display_time()
		],
		['Unpause', ->
			@time: Date.now()
			@paused: yes
			display_time()
		]]
		
	animate 1, ->
		update_time()
		display_time()