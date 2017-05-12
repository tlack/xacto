const X=require('../xacto')();
let m=new Map();
m.set('blah',100);
m.set('xxx',200);
X.assert(X.equal(emit(X.key(m),'k'), Array.from(m.keys())), 't-21-mapkey');
emit('done');
