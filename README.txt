 _                 _       
| |               | |      
| |__   ___   ___ | |_ ___ 
| '_ \ / _ \ / _ \| __/ __|
| |_) | (_) | (_) | |_\__ \
|_.__/ \___/ \___/ \__|___/
                           
a tinnny GUI toolkit for JavaScript
(inspired by _why's Ruby Shoooooes)

01234567890123456789012345678901234567890123456789012345678901234567890123456789

HELLO HI Welcome to Boots, a tiny GUI toolkit for JavaScript :)
But how you say? Let's start:

1. Make a new HTML file.
2. Include Boots.js and Boots.css, anyway you know how.
3. Add code. Try this:

<script>
Boots.app({title: 'Boots Example', width: 300, padding: 15},
  stack(
    title('Boots Example'),
    para('This is an example of ', strong('Boots'),
      ', a tiny GUI toolkit for JavaScript.'),
  )
);
</script>  

Boots.app starts our application! You then pass it some properties, like width,
and padding. Then you can pass it as many children as you want. Some children
are like "title('Boots Example')" and display a block of text. Some are like
stack(...) and order everything inside of them vertically, or flow(...), which
orders them horizontally. Neat-o!

But kids these days are all about flash and pizazz, what with their Ataris and
Wizards of Wor. So let's add some interactivity:

<script>
Boots.app({title: 'Boots Example', width: 300, padding: 15},
  stack(
    title('Boots Example'),
    para('This is an example of ', strong('Boots'),
	  ', a tiny GUI toolkit for JavaScript.'),
    $button = button('Click me!',
      function click(e) {
        $label('Button has been CLICKed! :o');
      },
      function release(e) {
        $label('Button has been RELEASEd! :D');
      }
    ),
    $label = span('Waiting on you. :)')
  )
);
</script>

See what we did there? We added a button() and a span(), but we also assigned
these guys to the variables $button and $label, so we can reference them later.
Also look at the button()--it's got functions in it! You can pass these as
children too. But these functions have names like 'click' and 'release', which
IS IMPORTANT. Cause that means they are launched when you CLICK and RELEASE the
button. Try running it!

Hope you have fun. :) Take a look through the examples and try your own. Let me
know if you make anything nifty! And if you like this, don't forget the
original footwear that started it all:

http://github.com/shoes/shoes