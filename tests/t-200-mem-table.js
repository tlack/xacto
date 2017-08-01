const NROWS=256;

let X=require('../xacto')();
let t=X.table('test', {a:'string', b:'int', c:'string'}, ['mem']);
let i;

for (i=0; i<NROWS; i++)
	t.ins({a:X.choice(['tom','arca','tyler']),b:X.rand(50),c:Date.now().toString()})

X.assert(t.sel({b:42}).length>0,'t-mem-table 0');
X.emit('done');



