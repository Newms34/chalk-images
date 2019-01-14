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
###Full Color Output (OSX and/or POSIX only)
![Kurt Cobain](http://i.imgur.com/PpRso1n.png)


##Instructions:

Just include your chalk-image: `var ci = require('chalk-image');`

Then draw!: `ci.drawImg('path/to/my/img.jpg');`

Works best with BMPs and JPEGs!

###Options:
There are a number of options available:

 1. You can specify true-color modes by adding '256' (256-color mode) or '16' or '16m' (16 million 'true-color' mode):
 
 `ci.drawImg('path/to/my/img.jpg',16);`

 This does now works in windows. Happy!
 2. You can ask the drawImg function to return a promise, which you can then use to export the 'image' to whatever:

 `var myProm = ci.drawImg('path/to/my/img.jpg',16);`
 then
 `myProm.done(someCallBack(data));`

 Note that you cannot just export the string directly, since the wizardry involves some asynchronous file-reading operations.

##Tests:
Go ahead and `cd` into the 'tests' folder. I've stuck a separate readme in there too, just to make things nice and easy.

##Issues:
 1. Does not currently seem to work with animated GIFs. This is partially because the time-component of gifs seems to not really be easily parsable. It's also partially because the amount of data for animated gifs is actually rather *huge* (a 100x100, 3 second gif is 2.16M separate points of data)!
 2. ~~The full-color mode only works on OSX (POSIX?) systems~~. Nevermind! Windows (or chalk.js?) now supports color! Cool!


##Credits:
 - Written by me, [David Newman](https://github.com/Newms34).
 - Color stuff provided by the awesome peeps who made the [chalk](https://github.com/chalk/chalk) and [ansi-styles](https://github.com/chalk/ansi-styles/) modules.
