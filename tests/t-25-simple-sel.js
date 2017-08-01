const X=require('../xacto')();
let z=[100,2000,300,100];
X.assert(X.equal(X.sel(z), z), 't-25-simple-sel 0');
X.assert(X.equal(X.emit(X.where(z,100)), [0,3]), 't-25-simple-sel 1');
X.emit('done');
