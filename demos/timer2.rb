# A timer applications
# uzimonkey@gmail.com

# A button that toggles between two buttons
class ToggleButton
  def initialize( box, width, bef, b1, b2 )
    @box = box
    @width = width
    @bef = bef
    @b = [b1, b2]

    @click_proc = proc {
      @b[0][1].call
      switch_buttons
    }

    make_button
  end

  def switch_buttons
    @cb.remove
    @b.reverse!
    make_button
  end

  def make_button
    @box.before @bef do
      @cb = @box.button @b[0][0], :width => @width
      @cb.click @click_proc
    end
  end
end

Shoes.app :width => 200, :height => 120, :resizable => false do
  @paused = false
  background '#222'..'#aaa'

  def update_time
    @seconds = Time.now - @time unless @paused
  end

  def display_time
    seconds = (@times + [@seconds]).inject(0) do|m,n|
      m + n
    end.to_i

    @display.clear do
      title "%02d:%02d:%02d" % [
        seconds / (60*60),
        seconds / 60 % 60,
        seconds % 60
      ], :stroke => @paused ? gray : white
    end
  end

  def reset
    @seconds = 0
    @time = Time.now
    @times = []
  end

  @display = stack :margin => 10
  reset
  display_time

  @box = flow do
    @reset = button "Reset", :width => '50%' do
      reset
      display_time
    end
  end

  ToggleButton.new( @box, '50%', @test,
    [ "Pause",   proc {
      update_time
      @times << @seconds
      @seconds = 0

      @paused = true
      display_time
    } ],
    [ "Unpause", proc {
      @time = Time.now
      @paused = false
      display_time
    } ]
  )

  animate(1) do
    update_time
    display_time
  end
end
