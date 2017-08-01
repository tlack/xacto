const X=require('../xacto')();

let aleph=55;

let r=X.range(1, 11);
X.emit(r, 'r');
let s=X.sum(X.range(1,11)); 
X.emit(s, 's');
X.assert(X.equal(s,aleph),'sum 0')

let r2=X.range(1, 11, function(x){ return x.toString() });
X.emit(r2, 'r2');
let s2=X.sum(r2, 0);
X.emit(s2, 's2');
X.assert(X.equal(s2,aleph),'sum 1');

X.assert(X.equal(X.min(s),X.min(s2)),'sum min');

X.emit('done')
