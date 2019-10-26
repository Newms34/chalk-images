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

const drawImg = (im_url, opts) => {
    // im_url, colMode, exportMe
    //if mode is blank or not one of the defined options, render using color 'names' (i.e., red, green, yellow, etc.). 
    //if 256, render using 256 color mode. if 16 or 16m, use 16million color mode
    // console.log(im_url, colMode, exportMe)
    let exportMe = !!opts && !!opts.exportMe,
        def = null;
    colOpts = ['256', '16m', '16'],
        colMode = !!opts && !!opts.colMode && colOpts.includes(opts.colMode) ? opts.colMode : null,
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
        vc(['Creating promise!'], true)
        def = Q.defer();
    }
    gp(im_url, function (err, px) {
        vc(['img width', dims.width, '\nimg height', dims.height, '\nTerminal width', process.stdout.columns, '\nTerminal Height', process.stdout.rows], vb)
        // vc(['image width', dims.width, 'which is columns (cmd width)', process.stdout.columns, '.\nImage height', dims.height, 'which is rows (cmd height)', process.stdout.rows], vb)
        const imDivWd = Math.max(Math.ceil(dims.width / (process.stdout.columns)), 1),//get the number of pixels wide each pixel 'chunk' will be
            imDivHt = imDivWd * 2;
        // imDivHt = Math.max(Math.floor(dims.height / (process.stdout.rows)), 1);
        vc(['chunk width', imDivWd, 'px by height', imDivHt, 'px'], vb)
        if (err) {
            console.log(chalk.red('OH NO!'), 'Error:', err);
            return;
        }
        const rgbArr = [];

        //get all pixel RGB vals
        //note that we ignore every alpha (transparency) val, as this is unusable for the terminal
        for (let y = 0; y < dims.height; y++) {
            let row = [];
            for (let x = 0; x < dims.width; x++) {
                let newRGB = {
                    r: px.get(x, y, 0),
                    g: px.get(x, y, 1),
                    b: px.get(x, y, 2)
                };
                row.push(newRGB);
            }
            rgbArr.push(row);
        }
        // console.log(rgbArr)
        //we now have an array of all pixel rgb vals, with each pixel ALSO assigned its x and y coords (based on where it is in the array)
        //now we need to construct each chunk
        let chunkArr = [];
        const finalColArr = []; //to hold the final colors for chalk
        vc(['pixels in first chunk', imDivWd * imDivHt], vb)
        let cx = 0,//'center' x
            cy = 0,//'center' y
            dx = imDivWd, //the width of the chunk
            dy = imDivHt, //the height of the chunk
            chunkX = 0,
            chunkY = 0,
            theX = 0,
            theY = 0,
            str = '',
            badPxs = 0;
            //[y] THEN [x]

            const chunkSize = {
                w: Math.ceil(dims.width / process.stdout.columns),
                h: Math.ceil(dims.width / process.stdout.columns) * 2
            },
                defaultChunkSize = chunkSize.w * chunkSize.h,//assuming we're not on an edge or something (where we may be missing pixels), this should be the total number of pixels in each chunk
                needsBuffer = Math.max(0, process.stdout.columns - dims.width);
            let chnkCounter = 0;
            const numChunks = {
                w: Math.floor(process.stdout.columns / chunkSize.w) * chunkSize.w,
                h: Math.floor(dims.height / chunkSize.h)
            };
            // console.log('CHUNKS NOW', chunkSize, 'IMG SIZE', dims, 'CONSOLE WIDTH', process.stdout.columns, 'PIXELS', rgbArr.length * rgbArr[0].length, 'NUMBER O CHUNKZ', numChunks)

            for (let cy = 0; cy < numChunks.h; cy++) {
                for (let cx = 0; cx < numChunks.w; cx++) {
                    let tot = defaultChunkSize,
                        sumPx = { r: 0, g: 0, b: 0, t: defaultChunkSize };
                    for (let cix = 0; cix < chunkSize.w; cix++) {
                        for (let ciy = 0; ciy < chunkSize.h; ciy++) {
                            let actualX = (cx * chunkSize.w) + cix,
                                actualY = (cy * chunkSize.h) + ciy;
                            if (!!rgbArr[actualY] && !!rgbArr[actualY][actualX]) {
                                sumPx.r += rgbArr[actualY][actualX].r;
                                sumPx.g += rgbArr[actualY][actualX].g;
                                sumPx.b += rgbArr[actualY][actualX].b;
                            } else {
                                // tot--;
                                sumPx.t--;
                            }
                        }
                    }
                    sumPx.r = sumPx.r / tot;
                    sumPx.g = sumPx.g / tot;
                    sumPx.b = sumPx.b / tot;
                    sumPx.cx = cx;
                    sumPx.cy = cy;
                    sumPx.c = chnkCounter;
                    chnkCounter++;
                    // || (needsBuffer && chnkCounter === dims.width - 1)
                    if ((chnkCounter === numChunks.w)) {
                        //at end of row
                        chnkCounter = 0;
                        // if(!! needsBuffer){

                        // }else{
                        chunkArr.push('BREAK');
                        // }
                    } else {
                        chunkArr.push(sumPx);
                    }
                }
            }
            chunkArr = chunkArr.filter(a => typeof a == 'string' || !!a.t)
            vc(['chunk Arr length', chunkArr.length, 'bad pixels', badPxs], vb)
            //we now have an array of 'chunks'. For each chunk, get the color that corresponds with it
            for (let n = 0; n < chunkArr.length; n++) {
                if (chunkArr[n]=='BREAK'){
                    str+='\n'
                }else if(chunkArr[n] && chunkArr[n].r && !isNaN(chunkArr[n].r) && !isNaN(chunkArr[n].g) && !isNaN(chunkArr[n].b)) {
                    //if chunkArr exists at specified N, and its r,g, and b vals exist
                    let hsl = rgbToHsl(chunkArr[n].r, chunkArr[n].g, chunkArr[n].b);
                    let blok = ' ';
                    // vc(['COL MODE:',colMode],vb)
                    if (limitCols) {
                        let col = 'black';
                        if (chunkArr[n].r < 30 && chunkArr[n].g < 30 && chunkArr[n].b < 30) {
                            //black
                            // finalColArr.push('bgBlack')
                            col = 'black';
                        } else if (chunkArr[n].r > 230 && chunkArr[n].g > 230 && chunkArr[n].b > 230) {
                            //white
                            // finalColArr.push('bgWhite')
                            col = 'bgWhite';
                        } else if (hsl[1] > 0.1 && (hsl[2] * 300) > 125) {
                            //light color, so bgCol
                            if ((hsl[0] * 255) < 30) {
                                col = 'bgRed';
                            } else if ((hsl[0] * 255) < 90) {
                                col = 'bgYellow';
                            } else if ((hsl[0] * 255) < 150) {
                                col = 'bgGreen';
                            } else if ((hsl[0] * 255) < 210) {
                                col = 'bgCyan';
                            } else if ((hsl[0] * 255) < 270) {
                                col = 'bgBlue';
                            } else {
                                col = 'bgMagenta';
                            }
                        } else if (hsl[1] > .1) {
                            //dark color so just col
                            if ((hsl[0] * 255) < 30) {
                                col = 'red';
                            } else if ((hsl[0] * 255) < 90) {
                                col = 'yellow';
                            } else if ((hsl[0] * 255) < 150) {
                                col = 'green';
                            } else if ((hsl[0] * 255) < 210) {
                                col = 'cyan';
                            } else if ((hsl[0] * 255) < 270) {
                                col = 'blue';
                            } else {
                                col = 'magenta';
                            }
                        } else {
                            //default to grey
                            col = 'grey';
                        }
                        str+=chalk[col](' ')
                    } else if (colMode == '256') {
                        str += fullCol.bgColor.ansi256.rgb(parseInt(chunkArr[n].r), parseInt(chunkArr[n].g), parseInt(chunkArr[n].b)) + blok + fullCol.bgColor.close;
                    } else if (colMode == '16' || colMode == '16m') {
                        str += fullCol.bgColor.ansi16m.rgb(parseInt(chunkArr[n].r), parseInt(chunkArr[n].g), parseInt(chunkArr[n].b)) + blok + fullCol.bgColor.close;
                    }
                }
                // if ((n + 1) % process.stdout.columns == 0 && str[str.length - 1] != '|') {
                //     str += '|'
                // }
                // if(!!bufferLen && (n)%dims.width===0){
                //     //if this image is less wide than our terminal, append with strings
                //     str+=' '.repeat(bufferLen)
                // }
            }
            // if (limitCols) {
            //     for (var q = 0; q < finalColArr.length; q++) {
            //         theFn = chalk[finalColArr[q]];
            //         var pxTxt = finalColArr[q].indexOf('bg') != -1 ? ' ' : '#';
            //         str += theFn(pxTxt) + theFn(pxTxt);
            //     }
            // }
       
        if (exportMe) {
            def.resolve(str);
        } else {
            // console.log("WOULD DRAW IMG HERE")
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