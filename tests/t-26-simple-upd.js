const X=require('../xacto')();
let z

z=[100,2000,300,100];
X.assert(X.equal(emit(X.upd(z,0,10)), [10,2000,300,100]), 't-26-simple-upd 0');
emit(z,'z1');

z=[100,2000,300,100];
X.assert(X.equal(emit(X.upd(z,[0,3],[10,10])), [10,2000,300,10]), 't-26-simple-upd 1');
emit(z,'z2');
emit('done');
