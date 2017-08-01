const X=require('../xacto')();
let z

z=[100,2000,300,100];
X.assert(X.equal(X.emit(X.upd(z,0,10)), [10,2000,300,100]), 't-26-simple-upd 0');
X.emit(z,'z1');

z=[100,2000,300,100];
X.assert(X.equal(X.emit(X.upd(z,[0,3],[10,10])), [10,2000,300,10]), 't-26-simple-upd 1');
X.emit(z,'z2');

z={a:1, b:10, c:1000};
X.assert(X.equal(X.emit(X.upd(z,'a',5)),{a:5,b:10,c:1000}),'t-26-simple-upd 2');
X.emit(z,'z3');

X.emit('done');
