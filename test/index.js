var chalk = require('chalk'),
    gp = require('get-pixels'),
    imSz = require('image-size');
var dims = imSz('doghed.png');
gp('doghed.png', function(err, px) {
    if (err) {
        console.log(chalk.red('OH NO!'), 'Error:', err);
        px.get(x, y, 0);
        return;
    }
    console.log(px.data);
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
    console.log(rgbArr)
    var imDiv = Math.ceil(dims.width / 80); //get the number of pixels wide each pixel 'chunk' will be
    var chunkArr = [];
    var finalColArr = []; //to hold the final colors for chalk
    for (var i = 0; i < dims.height; i += imDiv) {
        console.log('on row', i, 'imDiv', imDiv);
        for (var j = 0; j < dims.width; j += imDiv) {
            console.log('on col', j)
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
            // console.log(avg.g)
            //and push into chunkarr
            chunkArr.push(avg);
        }

    }
    console.log(chunkArr)
    // for (var h = 0; h < dims.height; h += imDiv) {
    //     for (var w = 0; w < dims.width; w += imDiv) {
    //         var r = 0,
    //             g = 0,
    //             b = 0,
    //             t = Math.pow(imDiv, 2);
    //         for (var a = 0; a < imDiv; a++) {
    //             for (var p = 0; p < imDiv; p++) {
    //                 if (rgbArr[(h + a) + '-' + (w + p)]) {
    //                     r += rgbArr[(h + a) + '-' + (w + p)].red;
    //                     g += rgbArr[(h + a) + '-' + (w + p)].green;
    //                     b += rgbArr[(h + a) + '-' + (w + p)].blue;
    //                 } else {
    //                     t--;
    //                 }
    //             }
    //         }
    //         chunkArr.push({
    //             r: r / t,
    //             g: g / t,
    //             b: b / t
    //         });
    //     }
    // }

    for (var n = 0; n < chunkArr.length; n++) {
        if (!isNaN(chunkArr[n].r) && !isNaN(chunkArr[n].g) && !isNaN(chunkArr[n].b)) {
            var hsl = rgbToHsl(chunkArr[n].r, chunkArr[n].g, chunkArr[n].b);
            console.log('HSL:', hsl)
            if (chunkArr[n].r < 30 && chunkArr[n].g < 30 && chunkArr[n].b < 30) {
                //black
                finalColArr.push('bgBlack')
            } else if (chunkArr[n].r > 230 && chunkArr[n].g > 230 && chunkArr[n].b > 230) {
                //white
                finalColArr.push('bgWhite')
            } else if (hsl[1] > 0.1) {
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
                    // finalColArr.push('bgMagenta')
                }
            }
        }
    }
    console.log(finalColArr);
    var str = '';
    for (var q = 0; q < finalColArr.length; q++) {
        theFn = chalk[finalColArr[q]];
        console.log('len', str.length % imDiv, imDiv, str.length)
        str += theFn(' ');
        if (q % 80 == 0) {
            str += '||'
        }
    }
    console.log(str)
});

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

//console is 80px wide