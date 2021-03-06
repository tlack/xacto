const NROWS=1000;
const X=require('../xacto')('testdb');
let logopts=X.logDflOpts;
X.emit(logopts,'logger default options');
logopts.verbose=true;

let s=X.table('students',{name:'string',age:'int',species:'string',addt:'string'},[X.mem, X.logger(logopts)]);

// remember, we may have loaded old log entries here.. so our sanity checks must incorporate that
let startrows=len(s);
X.emit(startrows,'rows loaded from log');
X.emit(X.logger.logStats,'log stats');

let i;
for(i=0;i<NROWS;i++){
	s.ins({name:choice(['tom','arca','tyler']),age:X.rand(100),species:'fish'});
}

X.assert(X.len(s)==startrows+NROWS,'t-300-rows');
X.emit('done');


