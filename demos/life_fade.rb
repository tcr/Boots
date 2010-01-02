# The Game of Life
# This code is released into the Public Domain
# Revision 4-with-fades
# jashkenas@gmail.com

# This edit includes fading of cells between generations, just for visuals.
# kevinc, connerk@gmail.com

class Life
  CRITTERS_TO_START_WITH = 100  # The amount of critters to make if you seed.
  #  WIDTH and HEIGHT are counted in critters
  WIDTH = 35
  HEIGHT = 25
  UNIT = 24  # The dimensions of a single critter
  PIXEL_WIDTH = UNIT * WIDTH
  PIXEL_HEIGHT = UNIT * HEIGHT
  CONTROLS_HEIGHT = 50
  @speed = 25
  @time_between_frames = 0.0 #0.0 to 1.0 linearly, loop each frame
  @fade_period = 0.40 #fade during the first __% of the time between frames
  @fade_interpolant = 0.0 #0.0 to 1.0 on an s-curve
    
  # Iterator for each critter
  def self.each
    WIDTH.times do |x|
     HEIGHT.times do |y|
        yield(x,y)
      end
    end
  end
  
  def self.set_speed(speed_factor)
    if @paused
      @paused = (speed_factor * 50 + 1).to_i
    else
      @speed = (speed_factor * 50 + 1).to_i
    end
  end
  
  # Let's us change speed without messing with the animate loop.
  def self.maybe_update(counter)
    if counter % @speed == 0 && @speed < 100
      set_time_between_frames(0.0)
      GoldenPlain.armageddon_and_resurrection
    else
      set_time_between_frames(@time_between_frames + 1.0 / @speed)
      GoldenPlain.draw
    end
  end
  
  def self.set_time_between_frames(time)
    @time_between_frames = [time, @fade_period].min
    # scale the low-to-high half of a cosine curve and fit that between 0 and 1.
    # factoring this into critter opacity makes for a smooth fade between two generations.
    @fade_interpolant = (1 - Math.cos(@time_between_frames * Math::PI / @fade_period)) / 2
  end
  
  def self.fade_interpolant
    @fade_interpolant
  end
  
  def self.pause
    if @paused
      @speed = @paused
      @paused = nil
      GoldenPlain.background_text = nil
    else
      @paused = @speed
      @speed = 100
      GoldenPlain.background_text = "Paused"
    end
    GoldenPlain.draw
  end
  
  # Delegate clicks to the GoldenPlain or to the Slider, as necessary
  def self.click(button, x, y)
    if button == 1
      if y < Life::PIXEL_HEIGHT
        @clicking = true
        GoldenPlain.click(x, y, true)
      else
        ControlPanel.start_slide(x, y)
      end
    end
  end
  
  def self.motion(x,y)
    GoldenPlain.click(x, y, false) if @clicking
    ControlPanel.maybe_motion(x, y)
  end
  
  def self.release(button,x,y)
    if button == 1
      @clicking = false
      ControlPanel.end_slide 
    end
  end
end

class GoldenPlain
  class << self; attr_accessor :background_text; end
  def self.reset
    @critters = self.fresh_array
    @previous_critters = self.fresh_array
    @plain = $app.flow(:margin => 0, :top => 0, :left => 0, :width => Life::PIXEL_WIDTH, :height => Life::PIXEL_HEIGHT + 10) if !@plain
    @plain.clear
    self.draw
  end
  
  def self.fresh_array
    return Array.new(Life::WIDTH) { Array.new(Life::HEIGHT) { nil } }
  end
  
  def self.seed_randomly
    self.reset
    Life::CRITTERS_TO_START_WITH.times do
      x, y = rand(Life::WIDTH), rand(Life::HEIGHT)
      @critters[x][y] = Critter.new(x,y)
    end
    self.draw
  end
  
  def self.draw
    @plain.clear do
      $app.para(@background_text, :stroke => $app.rgb(0.1, 0.1, 0.3), :top => 177, :left => 107, :font => '180px') if @background_text
      Life.each do |x,y|
        if @critters[x][y] and @previous_critters[x][y]
          @critters[x][y].draw
        elsif @critters[x][y]
          @critters[x][y].draw(Life.fade_interpolant)
        elsif @previous_critters[x][y]
          @previous_critters[x][y].draw(1.0 - Life.fade_interpolant)
        end
      end
    end
  end
  
  # Makes it easier to draw critters than it is to erase them.
  def self.click(x, y, new_click)
    x, y = (x/Life::UNIT).to_i, (y/Life::UNIT).to_i
    if x >= 0 && x < Life::WIDTH && y >=0 && y < Life::HEIGHT
      if @critters[x][y]
        @critters[x][y] = nil if new_click
      else
        @critters[x][y] = Critter.new(x, y)
      end
    end
    self.draw
  end
  
  # Check all surrounding squares, and add up the head count.
  def self.has_neighbor?(x, y)
    sum = 0
    (-1..1).each do |x_around|
      (-1..1).each do |y_around|
        test_x, test_y = x + x_around, y + y_around
        if test_x >= 0 && test_x < Life::WIDTH && test_y >= 0 && test_y < Life::HEIGHT
          unless x_around == 0 && y_around == 0
            sum += 1 if @critters[test_x][test_y]
          end
        end
      end
    end
    sum
  end
  
  # Rules of life and death.
  def self.alive?(x, y, sum)
    if (sum == 3) || (sum == 2 && @critters[x][y])
      return true
    else
      return false
    end
  end
  
  # Make a new generation of critters
  def self.armageddon_and_resurrection
    afterlife = self.fresh_array
    Life.each do |x, y|
      sum = self.has_neighbor?(x, y)
      afterlife[x][y] = Critter.new(x,y) if self.alive?(x, y, sum)
    end
    @previous_critters = @critters
    @critters = afterlife
    self.draw
  end
end

class Critter  
  def initialize(x,y)
    @x, @y = x, y
    @bonus_blueness = (rand*0.6)
  end
  
  def draw(opacity=1.0)
    $app.stroke($app.gray(1.0, 0.6 * opacity))
    $app.fill($app.rgb(0.2, 0.2, 0.4 + @bonus_blueness, 0.45 * opacity))
    $app.oval(@x*Life::UNIT, @y*Life::UNIT, Life::UNIT-1, Life::UNIT-1)
  end
end

class ControlPanel
  # Setup the controls - they will not be redrawn.
  def self.setup
    $app.flow :margin_top => 4, :margin_left => 15, :top => Life::PIXEL_HEIGHT + 10, :left => 0 do
      $app.nostroke
      $app.fill($app.gray(0.1))
      $app.rect(0, Life::PIXEL_HEIGHT, Life::PIXEL_WIDTH, Life::CONTROLS_HEIGHT)
      $app.button("Clear", :width => 85) do
        Life.set_time_between_frames(0.0)
        GoldenPlain.reset
      end
      $app.button("Seed", :margin_left => 10, :width => 85) do
        Life.set_time_between_frames(0.0)
        GoldenPlain.seed_randomly
      end
      $app.button("Pause", :margin_left => 10, :width => 85) { Life.pause }
    end
    @slider = Slider.new
  end
  
  def self.start_slide(x, y)
    if @slider.contains?(x, y)
      @sliding = true
    end
  end
  
  # Make sure to only change the speed if you actually clicked on the slider.
  def self.maybe_motion(x, y)
    if @sliding
      @slider.move_to(x,y) 
      Life.set_speed(@slider.get_percentage)
    end
  end
  
  def self.end_slide
    @sliding = false
  end
end

class Slider
  LEFT_END = 375
  RIGHT_END = 805
  def initialize
    @x, @y, @dimensions = 525, Life::PIXEL_HEIGHT + 19, 15
    $app.fill($app.gray(0.8, 0.7))
    $app.stroke($app.gray(1.0, 0.8))
    $app.strokewidth(3)
    @slider = $app.oval(@x, @y, @dimensions, @dimensions)
    $app.nostroke
    $app.fill($app.gray(0.8, 0.12))
    $app.rect(LEFT_END, @y + 5, RIGHT_END - LEFT_END, 5)
    $app.para("Speed:", :stroke => $app.gray(0.95), :font => '14px', :left => LEFT_END - 65, :top => @y - 5)
  end
  
  # Check for clicks on the slider knob.
  def contains?(x,y)
    return true if (@x..(@x + @dimensions)).include?(x) && (@y..(@y + @dimensions)).include?(@y)
    return false
  end
  
  def move_to(x, y)
    if (LEFT_END..RIGHT_END).include?(x)
      @x = x - (@dimensions/2)
      @slider.move(@x, @y)
    end
  end
  
  def get_percentage
    return 1 - (@x - LEFT_END).to_f / (RIGHT_END - LEFT_END).to_f
  end
end

Shoes.app :width => Life::PIXEL_WIDTH, :height => Life::PIXEL_HEIGHT + Life::CONTROLS_HEIGHT, 
          :resizable => false, :title => "The Game of Life" do 
  $app = self
  background(rgb(0.05, 0.05, 0.2))
  counter = 0
  GoldenPlain.reset
  ControlPanel.setup
  
  animate(30) do
    counter += 1
    Life.maybe_update(counter)
  end
  
  click do |button, x, y|
    Life.click(button, x, y)
  end
  
  motion do |x, y|
    Life.motion(x, y)
  end
  
  release do |button, x, y|
    Life.release(button, x,y)
  end
end