# Chalk Image Converter
*Important note!:*
The format of the options available for chalk-image has recently changed (they're actually easier now! You're welcome). Please make sure you read the new options format if your app breaks!

---
## About:

Convert your images into console-code with Chalk!

----
## Examples:

#### Input:
![Kurt Cobain](http://i.imgur.com/eyDxWba.jpg)
----
#### Output:
`ci.drawImg('somePicture.jpg',{})`
![Kurt Cobain, drawn in classic mode](http://i.imgur.com/QT4lVBA.jpg)
----
#### Full Color Output
`ci.drawImg('somePicture.jpg',{colMode:'16m'})`
![Kurt Cobain, drawn in full color mode](http://i.imgur.com/PpRso1n.png)

---
### Instructions:

Just include your chalk-image: `const ci = require('chalk-image');`

Then draw!: `ci.drawImg('path/to/my/img.jpg');`

Works best with BMPs and JPEGs!

---
### Options:
There are a number of options available. These are passed to `drawImg()` as a secondary optional options object. The properties of this object are as follows:
 - **exportMe**: Default false. If true, `drawImg()` will return a `.then`able promise. Otherwise, `drawImg()` will simply draw the image when it's finished mathing it.
 - **verbose**: Default false. If true, you'll get some extra info about the image (and console) dimensions. Useful if you wanna debug stuff.
 - **colMode**: Default no value. If set to `16` or `16m`, will draw in 16-million color mode. If set to `256`, will draw in 256-color mode. Otherwise, It'll draw in good-old-fashioned 16 color mode. 

----
### Tests:
Go ahead and `cd` into the 'tests' folder. I've stuck a separate readme in there too, just to make things nice and easy.

---
### Issues:
 1. Does not currently work with animated GIFs. This for a number of reasons. Firstly, GIFs are not necessarily stored in individual, separate frames. If part of an animated GIF doesn't change, that part may not necessarily be 'part' of each new frame. Second, the amount of data for animated gifs is actually rather *huge* (a 100x100, 3 second GIF, with 256 colors at 30FPS, is potentially 2.3 *billion* separate numbers)! Finally, while there are methods to clear individual pixels in the console, none of them are terribly quick or efficient.
 2. There's a bit of an issue with certain combinations of image dimensions and console dimensions, where the resulting image 'rows' end up overflowing. This in turn results in heavily distorted images. If you can help fix it, feel free to submit a pull request.
 3. Full color *should* work on all systems. However, until recently, Windows systems (or ChalkJS?) didn't support color. So be warned that YMMV.

---
### Credits:
 - Written by me, [David Newman](https://github.com/Newms34).
 - Color stuff provided by the awesome peeps who made the [chalk](https://github.com/chalk/chalk) and [ansi-styles](https://github.com/chalk/ansi-styles/) modules.
