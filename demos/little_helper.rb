=begin
  A little Shoes app to calculate the monthly income depending on
  hourly wage, amount of working hours/week and tax rate.

  Author: Michael Kohl <citizen428@gmail.com>

  http://the-shoebox.org/apps/126
=end
Shoes.app :title => "Little Helper v0.3", :width => 200, :height => 235 do

  def calculate
     @hours.text.to_f * @wage.text.to_f * ((100-@tax.text.to_f)/100.0) * 4.3
  end

  stack :margin => 10 do
    caption "Awful numbers"

    flow :width => 150 do
      para "Hours/week " 
      @hours = edit_line(:width => 30) { @money.text = calculate }

      para "Money/hour"
      @wage = edit_line(16, :width => 30) { @money.text = calculate }

      para "Tax (in %)"
      @tax = edit_line(20, :width => 30) { @money.text = calculate }
    end

    caption "Rags or riches"
    @money = para "0.0" 
  end
end
