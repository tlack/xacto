const X=require('../xacto')();
const z=X.range(0,1000,function(){return X.rand(100)});
X.assert(X.member(z, X.rand(100)), 'choice 1');
X.assert(X.member(z, X.rand(100)), 'choice 2');
X.assert(X.member(z, X.rand(100)), 'choice 3');
X.assert(X.member(z, X.rand(100)), 'choice 4');
X.emit('done');

