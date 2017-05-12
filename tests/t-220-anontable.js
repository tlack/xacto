const X=require('../xacto')();
let t=X.table('',{name:'string',age:'int'});
t.ins({name:'blah',age:10});
emit(X.tbl);
emit(t.sel());

