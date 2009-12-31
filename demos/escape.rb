class Light
  attr_reader :centerx, :centery

  def initialize(slot)
    @ampx = rand(300)
    @ampy = rand(300)
    @anglex = rand(360)
    @angley = rand(360)
    @originx = rand(600)
    @originy = 50 + rand(500)
    @centerx = @originx + @ampx * Math.sin(Math::PI*@anglex/180)
    @centery = @originy + @ampy * Math.sin(Math::PI*@angley/180)
    slot.append do
      slot.stroke rgb(1.0, 1.0, 0.0, 0.7)
      slot.fill rgb(1.0, 1.0, 0.0, 0.7)
      @circ = slot.oval @centerx, @centery, 150, :center => true, :stroke => nil
    end
    @dx = 1 + rand(2)
  end

  def move
    @anglex += @dx;
    @angley += 1;
    @centerx = @originx + @ampx * Math.sin(Math::PI*@anglex/180)
    @centery = @originy + @ampy * Math.sin(Math::PI*@angley/180)
    @circ.move @centerx, @centery
  end

end

Shoes.app :width => 600, :height => 600 do

  MAN_X = self.width/2
  MAN_Y = 590

  def game_start
    if @clear
      @stage += 1
      3.times do
        @lights << Light.new(@light_slot)
      end
    end
    @man.move(MAN_X, MAN_Y)
    @text.replace "Start #", @stage.to_i
    @text.show
    @clear = false
    @failed = false
    @start = true
  end

  def game_clear
    @text.replace "Escaped"
    @clear = true
  end

  def game_failed
    @text.replace "You are detected."
    @failed = true
  end

  background black
  @stage = 0
  @clear = true

  @lights = Array.new
  @light_slot = stack

  nofill
  stroke red
  line 0, 15, self.width, 15

  nostroke
  fill "#333"
  rect width/2, height - 10, 40, 20, :center => true

  fill blue
  @man = rect MAN_X, MAN_Y, 10, 10, :center => true

  @text = para "Start", :stroke => red, :align => "center", :size => 26, :top => height/2 - 42

  game_start

  motion do |left, top|
    if @clear or @failed
      return
    end
    if (@man.left - left).abs <= 30 and (@man.top - top).abs <= 30
      if @start
        @start = false
        @text.replace ""
      end
      @man.move left, top
      if @man.top <= 5
        game_clear
      end
    end
  end

  click do |button, x, y|
    if @clear or @failed
      game_start
    end
  end

  animate(60) do
    @lights.each do |light|
      light.move
    end
    if @start or @clear or (@man.left >= width/2 - 20 and @man.left <= width/2 + 10 and @man.top >= height - 20)
      return
    end
    @lights.each do |light|
      if Math.sqrt((light.centerx - (@man.left + 5)) ** 2 + (light.centery - (@man.top + 5)) ** 2) <= 80
        game_failed
      end
    end
  end

end

