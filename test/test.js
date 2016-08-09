var di = require('../'),
q = require('../node_modules/q');

var p = di.drawImg('test.jpeg',256,true);
console.log('promise from drawImg',p.done(function(s){
	console.log('\n',s)
}))
