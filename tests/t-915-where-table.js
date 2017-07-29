const X=require('../xacto')();

let t=X.table('barf',{a:'string',b:'int'});

for(let i=0; i<100; i++) 
	t.ins({a:'barf '+i,b:i*3});

X.assert(X.len(t)===100,'1 len');
X.assert(X.len(X.where(t))===100,'2 where len');
var q=t.where({b:0});
X.assert(X.equal(q,[0]),'3 where eq 0');
var q=t.where({b:99});
X.assert(X.equal(q,[33]),'4 where eq 99');
emit('done')

