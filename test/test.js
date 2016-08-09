var di = require('../'),
    q = require('../node_modules/q');

if (process.argv[3] === true || process.argv[2] === true) {
    var p = di.drawImg('test.jpeg', process.argv[2], process.argv[3]);
    p.done(function(s) {
        console.log('\n', s)
    })
}else{
	var col = process.argv[2]=='16'||process.argv[2]=='16m'||process.argv[2]=='256'?process.argv[2]:null;
	di.drawImg('test.jpeg',col)
}
