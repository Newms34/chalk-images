const chalk = require('chalk'),
    gp = require('get-pixels'),
    imSz = require('image-size'),
    fullCol = require('./colStuff.js'),
    Q = require('q');
// sc = require('supports-color'),
// os = require('os');

const vc = (t, m) => {
    //verbose console
    if (m) {
        console.log(t.join(' '));
    }
}

const drawImg = (im_url,opts) => {
    // im_url, colMode, exportMe
    //if mode is blank or not one of the defined options, render using color 'names' (i.e., red, green, yellow, etc.). 
    //if 256, render using 256 color mode. if 16 or 16m, use 16million color mode
    // console.log(im_url, colMode, exportMe)
    let exportMe = !!opts && !!opts.exportMe,
        def = null;
        colOpts = ['256','16m','16'],
        colMode = !!opts && !!opts.colMode && colOpts.includes(opts.colMode)?opts.colMode:null,
        vb = !!opts && !!opts.verbose;
    try {
        var dims = imSz(im_url);
    } catch (e) {
        console.log(chalk.red('ERR:'), 'Could not load image', chalk.magenta(im_url), '.')
        console.log(e)
        return false;
    }

    const limitCols = (colMode != '16' && colMode != '16m' && colMode != '256');
    if (exportMe) {
        vc(['Creating promise!'],true)
        def = Q.defer();
    }
    gp(im_url, function(err, px) {
        vc(['image width', dims.width, 'which is columns (cmd width)', process.stdout.columns, '.\nImage height', dims.height, 'which is rows (cmd height)', process.stdout.rows], vb)
        const imDivWd = Math.max(Math.floor(dims.width / (process.stdout.columns)), 1), //get the number of pixels wide each pixel 'chunk' will be
        imDivHt = imDivWd*2;
            // imDivHt = Math.max(Math.floor(dims.height / (process.stdout.rows)), 1);
        vc(['chunk width', imDivWd, 'px by height', imDivHt, 'px'], vb)
        if (err) {
            console.log(chalk.red('OH NO!'), 'Error:', err);
            return;
        }
        const rgbArr = [];

        //get all pixel RGB vals
        for (let y = 0; y < dims.height; y++) {
            let row = [];
            for (let x = 0; x < dims.width; x++) {
                let newRGB = {
                    red: px.get(x, y, 0),
                    green: px.get(x, y, 1),
                    blue: px.get(x, y, 2)
                };
                row.push(newRGB);
            }
            rgbArr.push(row);
        }
        //we now have an array of all pixel rgb vals, with each pixel ALSO assigned its x and y coords (based on where it is in the array)
        const chunkArr = [];
        const finalColArr = []; //to hold the final colors for chalk
        vc(['pixels in first chunk', imDivWd * imDivHt], vb)
        let cx = 0,
            cy = 0,
            dx = imDivWd, //the width of the chunk
            dy = imDivHt, //the height of the chunk
            chunkX = 0,
            chunkY = 0,
            theX = 0,
            theY = 0;
        //[y] THEN [x]
        for (cy = 0; cy < dims.height-imDivHt; cy += imDivHt) {
            for (cx = 0; cx < dims.width-imDivWd; cx += imDivWd) {
                let tot = dx * dy, //num px in each chunk
                    avg = {
                        r: 0,
                        g: 0,
                        b: 0,
                        sx: cx,
                        sy: cy,
                    };
                for (chunkX = 0; chunkX < dx; chunkX++) {
                    for (chunkY = 0; chunkY < dy; chunkY++) {
                        theX = chunkX + cx;
                        theY = chunkY + cy;
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
                //finally, average the pixels
                avg.r = avg.r / tot;
                avg.g = avg.g / tot;
                avg.b = avg.b / tot;
                //and push into chunkarr
                chunkArr.push(avg);

            }
        }
        // require('fs').writeFileSync('out.json',JSON.stringify(chunkArr),'utf-8')
        // for (let i = 0; i < dims.height; i += imDivHt) {
        //     for (let j = 0; j < dims.width; j += imDiv) {
        //         let tot = imDiv * imDivHt;//total number of pixels in each chunk
        //         let avg = {
        //             r: 0,
        //             g: 0,
        //             b: 0
        //         }
        //         //now we're in one 'chunk'. We average all the rgb vals
        //         for (let y = 0; y < imDivHt; y++) {
        //             for (let x = 0; x < imDiv; x++) {
        //                 let theX = j + x;
        //                 let theY = i + y;
        //                 if (rgbArr[theY] && rgbArr[theY][theX]) {
        //                     avg.r += rgbArr[theY][theX].red;
        //                     avg.g += rgbArr[theY][theX].green;
        //                     avg.b += rgbArr[theY][theX].blue;
        //                 } else {
        //                     //this px doesnt exist, so subtract from tot (so that our average is accurate)
        //                     tot--;
        //                 }
        //             }
        //         }
        //         //now average
        //         avg.r = avg.r / tot;
        //         avg.g = avg.g / tot;
        //         avg.b = avg.b / tot;
        //         //and push into chunkarr
        //         chunkArr.push(avg);
        //     }

        // }
        // return false;
        vc(['chunk Arr length', chunkArr.length], vb)
        //we now have an array of 'chunks'. For each chunk, get the color that corresponds with it
        let str = '';
        for (let n = 0; n < chunkArr.length; n++) {
            if (!isNaN(chunkArr[n].r) && !isNaN(chunkArr[n].g) && !isNaN(chunkArr[n].b)) {
                //if chunkArr exists at specified N, and its r,g, and b vals exist
                let hsl = rgbToHsl(chunkArr[n].r, chunkArr[n].g, chunkArr[n].b);
                let blok = n % process.stdout.columns == 0 ? ' ' : ' ';
                if (limitCols) {
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
                } else if (colMode == '256') {
                    str += fullCol.bgColor.ansi256.rgb(parseInt(chunkArr[n].r), parseInt(chunkArr[n].g), parseInt(chunkArr[n].b)) + blok + fullCol.bgColor.close;
                } else if (colMode == '16' || colMode == '16m') {
                    str += fullCol.bgColor.ansi16m.rgb(parseInt(chunkArr[n].r), parseInt(chunkArr[n].g), parseInt(chunkArr[n].b)) + blok + fullCol.bgColor.close;
                }
            }
        }
        if (limitCols) {
            for (var q = 0; q < finalColArr.length; q++) {
                theFn = chalk[finalColArr[q]];
                var pxTxt = finalColArr[q].indexOf('bg') != -1 ? ' ' : '#';
                str += theFn(pxTxt) + theFn(pxTxt);
            }
        }
        if (exportMe) {
            def.resolve(str);
        } else {
            console.log(str);
        }
    });
    if (exportMe) {
        return def.promise;
    }

};
//http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion Thanks!

const rgbToHsl = (r, g, b) => {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
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