var X=require('../xacto')();
var t=X.table('z',{name:'string',age:'int'});
var r=t.sel({name:'rob'})
X.assert(r.length==0,'r length');
if(r.length==0) t.ins({name:'rob',age:10});
console.log(X.len(t));
console.log(t.len());
X.assert(X.len(t) === 1, 't length after ins a');
X.assert(t.len() === 1, 't length after ins b');
t.ins({name:'sam',age:99});
t.upd({name:'rob'},{age:50});
X.emit(t.sel());
X.assert(X.equal(t.where({age:50}),[0]), 'upd a');
X.upd(t,{name:'sam'},{age:0});
X.emit(t.sel());
X.assert(X.equal(t.where({age:99}),[]), 'upd b');
X.assert(X.equal(t.where({age:0}),[1]), 'upd c');
X.assert(X.equal(X.where(t,{age:50}),[0]), 'upd d');
X.assert(X.equal(X.where(t,{age:10}),[]), 'upd e');
X.emit('done')

