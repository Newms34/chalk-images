# Chalk Image Converter

##About:

Convert your images into console-code with Chalk!


##Examples:

###Input:
![Kurt Cobain](http://i.imgur.com/eyDxWba.jpg)
----
###Output:
![Kurt Cobain](http://i.imgur.com/QT4lVBA.jpg)
----
###Full Color Output
![Kurt Cobain](http://i.imgur.com/PpRso1n.png)


##Instructions:

Just include your chalk-image: `var ci = require('chalk-image');`

Then draw!: `ci.drawImg('path/to/my/img.jpg')`

Or draw in 256-color mode!: `ci.drawImg('path/to/my/img.jpg',256)`

Or draw in 16M-color mode!: `ci.drawImg('path/to/my/img.jpg',16)`

Works best with BMPs and JPEGs!

##Issues:
 1. Does not currently seem to work with animated GIFs. This is partially because the time-component of gifs seems to not really be easily parsable.
 2. The full-color mode is experimental. Don't be surprised if it doesn't work on your console!

##Credits:
 - Written by me, [David Newman](https://github.com/Newms34).
 - Color stuff provided by the awesome peeps who made the [chalk](https://github.com/chalk/chalk) and [ansi-styles](https://github.com/chalk/ansi-styles/) modules.
