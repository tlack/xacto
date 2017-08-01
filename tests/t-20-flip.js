const X=require('../xacto')();
const z={'name':['tom','arca','tyler'],age:[38,4*7,4]};
X.assert(
	X.equal(
		X.flip(z),
		[{name:'tom',age:38},{name:'arca',age:4*7},{name:'tyler',age:4}]
	), 'flip');
X.emit('done');
