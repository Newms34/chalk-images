var chalk = require('chalk'),
    gp = require('get-pixels'),
    imSz = require('image-size');

var drawImg = function(im_url) {
        try {
            var dims = imSz(im_url);
        }
        catch(e){
            console.log(chalk.red('ERR:'),'Could not load image',chalk.magenta(im_url),'.')
            return false;
        }
        gp(im_url, function(err, px) {
            var imDiv = Math.ceil(dims.width / (process.stdout.columns*.5)); //get the number of pixels wide each pixel 'chunk' will be
            if (err) {
                console.log(chalk.red('OH NO!'), 'Error:', err);
                px.get(x, y, 0);
                return;
            }
            var rgbArr = [];
            for (var y = 0; y < dims.height; y++) {
                var row = [];
                for (var x = 0; x < dims.width; x++) {
                    var newRGB = {
                        red: px.get(x, y, 0),
                        green: px.get(x, y, 1),
                        blue: px.get(x, y, 2)
                    };
                    row.push(newRGB);
                }
                rgbArr.push(row);
            }
            //we now have an array of all pixel rgb vals, with each pixel ALSO assigned its x and y coords
            var chunkArr = [];
            var finalColArr = []; //to hold the final colors for chalk
            for (var i = 0; i < dims.height; i += imDiv) {
                for (var j = 0; j < dims.width; j += imDiv) {
                    var tot = Math.pow(imDiv, 2);
                    var avg = {
                            r: 0,
                            g: 0,
                            b: 0
                        }
                        //now we're in one 'chunk'. We average all the rgb vals, and...
                    for (var x = 0; x < imDiv; x++) {
                        for (var y = 0; y < imDiv; y++) {
                            var theX = j + x;
                            var theY = i + y;
                            if (rgbArr[theY] && rgbArr[theY][theX]) {
                                avg.r += rgbArr[theY][theX].red;
                                avg.g += rgbArr[theY][theX].green;
                                avg.b += rgbArr[theY][theX].blue;
                            } else {
                                //this px doesnt exist, so subtract from tot (so that our average is accurate)
                                tot--;
                            }
                        }
                    }
                    //now average
                    avg.r = avg.r / tot;
                    avg.g = avg.g / tot;
                    avg.b = avg.b / tot;
                    //and push into chunkarr
                    chunkArr.push(avg);
                }

            }
            for (var n = 0; n < chunkArr.length; n++) {
                if (!isNaN(chunkArr[n].r) && !isNaN(chunkArr[n].g) && !isNaN(chunkArr[n].b)) {
                    var hsl = rgbToHsl(chunkArr[n].r, chunkArr[n].g, chunkArr[n].b);
                    if (chunkArr[n].r < 30 && chunkArr[n].g < 30 && chunkArr[n].b < 30) {
                        //black
                        finalColArr.push('bgBlack')
                    } else if (chunkArr[n].r > 230 && chunkArr[n].g > 230 && chunkArr[n].b > 230) {
                        //white
                        finalColArr.push('bgWhite')
                    } else if (hsl[1] > 0.1 && (hsl[2] * 300) > 125) {
                        //light color, so bgCol
                        if ((hsl[0] * 255) < 30) {
                            finalColArr.push('bgRed')
                        } else if ((hsl[0] * 255) < 90) {
                            finalColArr.push('bgYellow')
                        } else if ((hsl[0] * 255) < 150) {
                            finalColArr.push('bgGreen')
                        } else if ((hsl[0] * 255) < 210) {
                            finalColArr.push('bgCyan')
                        } else if ((hsl[0] * 255) < 270) {
                            finalColArr.push('bgBlue')
                        } else {
                            finalColArr.push('bgMagenta')
                        }
                    } else if (hsl[1] > .1) {
                        //dark color so just col
                        if ((hsl[0] * 255) < 30) {
                            finalColArr.push('red')
                        } else if ((hsl[0] * 255) < 90) {
                            finalColArr.push('yellow')
                        } else if ((hsl[0] * 255) < 150) {
                            finalColArr.push('green')
                        } else if ((hsl[0] * 255) < 210) {
                            finalColArr.push('cyan')
                        } else if ((hsl[0] * 255) < 270) {
                            finalColArr.push('blue')
                        } else {
                            finalColArr.push('magenta')
                        }
                    } else {
                        //default to grey
                        finalColArr.push('grey');
                    }
                }
            }
            var str = '';
            for (var q = 0; q < finalColArr.length; q++) {
                theFn = chalk[finalColArr[q]];
                var pxTxt = finalColArr[q].indexOf('bg') != -1 ? ' ' : '#';
                str += theFn(pxTxt) + theFn(pxTxt);
            }
            console.log(str)
        });
    }
    // drawImg('./test/rivsm.jpg')
    //http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion Thanks!
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}
module.exports = { drawImg: drawImg };