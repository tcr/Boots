# A Shoes Calculator
# Created by Dhanesh Purohit
# Dated: 16-12-2008
# I am still very new to Ruby and was playing around with the Shoes framework
# while this was created. I may keep working on this calculator and Shoes or Ruby framework
# in my journey to Ruby mastery [:)]. If you would like to contact me for anything then i am
# available at dhanesh.purohit[at]gmail.com
# Changes:
# version 0.2 - Now the array @operations is cleared before you can do more calculations
# on the result as that was causing miscalculations eg: 1+1+1 = 3 next calculation would take
# 1+1+13+1 = 16 which should actually be 4 ( I know i was silly but i fixed it now [:)])
# version 0.3 - The zero (0) button was missing and was added by J David Eisenberg. Many thanks to him.

Shoes.app(:title => "Shoes Calculator", :width => 240, :height => 318, :resizable => false) {

	@operations = []
	@exp = ""
	@numberbox = edit_line :width => 200, :top => 10,:left => 20, :height => 50
		
		@firstline = flow(:margin => 20, :top => 50) {
				
							stack {
								flow {
									@one = button "1", :width => 50, :height => 50, :curve => 10
									@two = button "2", :width => 50, :height => 50
									@three = button "3", :width => 50, :height => 50
									@plus = button "+", :width => 50, :height => 50
								}
								flow {
									@four = button "4", :width => 50, :height => 50
									@five = button "5", :width => 50, :height => 50
									@six = button "6", :width => 50, :height => 50
									@minus = button "-", :width => 50, :height => 50
								}
								flow {
									@seven = button "7", :width => 50, :height => 50
									@eight = button "8", :width => 50, :height => 50
									@nine = button "9", :width => 50, :height => 50
									@multiply = button "x", :width => 50, :height => 50
								}
								flow {
									@zero = button "0", :width => 50, :height => 50
									@dot = button ".", :width => 50, :height => 50
									@equals = button "=", :width => 50, :height => 50
									@divide = button "/", :width => 50, :height => 50
								}
								flow(:margin_left => 75){
									@clear = button "C", :width => 50, :height => 50
								}
							}
									@one.click {
										@numberbox.text += "1"
									}
								
									@two.click {
										@numberbox.text += "2"
									}
								
									@three.click {
										@numberbox.text += "3"
									}
									
									@four.click {
										@numberbox.text += "4"
									}
									
									@five.click {
										@numberbox.text += "5"
									}
									
									@six.click {
										@numberbox.text += "6"
									}
									
									@seven.click {
										@numberbox.text += "7"
									}
									
									@eight.click {
										@numberbox.text += "8"
									}
									
									@nine.click {
										@numberbox.text += "9"
									}
									
									@zero.click {
										@numberbox.text += "0" #Added by J David Eisenberg
									}
									
									@dot.click {
										@numberbox.text += "."
									}
									
									@clear.click {
										@numberbox.text = ""
										@operations = []
									}
									
									@plus.click {
										@operations << @numberbox.text
										@operations << "+"
										@numberbox.text = ""
									}
									
									@minus.click {
										@operations << @numberbox.text
										@operations << "-"
										@numberbox.text = ""
									}
									
									@multiply.click {
										@operations << @numberbox.text
										@operations << "*"
										@numberbox.text = ""
									}
									
									@divide.click {
										@operations << @numberbox.text
										@operations << "/"
										@numberbox.text = ""
									}
									
									@equals.click {
										@operations << @numberbox.text
										@oper = @operations.each { |operand| @exp = @exp + operand.to_s + " "}
										@numberbox.text = eval(@oper.to_s)
										@operations = []
									}
								}
}