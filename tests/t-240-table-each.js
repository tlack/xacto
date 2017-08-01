const NROWS = 256;

const X=require('../xacto')();
const t=X.table('test', {a:'int',b:'string'});

let total=0; 
for(let i=0; i<NROWS; i++) {
	let n=X.rand(100); total+=n;
	t.ins({a:n, b:X.choice(['tom','dick','hairy'])});
}

X.emit(total);

X.assert(X.emit(X.sum(t.each(function(x,i){ return x.a; })), 'sum') == total, 't 240 table each 0');

X.emit('done');

