const di = require('../'),
q = require('q');
console.log('ARGS', process.argv)
// if (process.argv[3] === true || process.argv[2] === true || process.argv[3] === 'true' || process.argv[2] === 'true') {
//     var p = di.drawImg('test.jpeg', process.argv[2], process.argv[3]);
//     p.done(function(s) {
//         console.log('\n', s)
//     })
// } else {
//     var col = process.argv[2] == '16' || process.argv[2] == '16m' || process.argv[2] == '256' ? process.argv[2] : null;
//     console.log('Drawing without promise')
//     di.drawImg('test.jpeg', {
//         colMode: col
//     });

// }

sortProps = (av) => {
    let colF = av.indexOf('-c'),
        verF = av.indexOf('-v'),
        colOpts = ['256', '16m', '16'],
        proF = av.indexOf('-p'),
        opts = {
            colMode: null,
            verbose: verF>-1,
            exportMe: proF>-1
        };
    if (colF > -1 && av[colF + 1] && colOpts.includes(av[colF + 1])) {
        opts.colMode = av[colF+1];
    }
    return opts;
}
const opts = sortProps(process.argv);
if(opts.exportMe){
	const p = di.drawImg('test.jpeg',opts)
	p.then(r=>{
		console.log('Got a promise back!\n'+r+'\nDone promise!')
	})
}else{
	console.log('Drawing with no promise\n')
	di.drawImg('test.jpeg',opts);
}