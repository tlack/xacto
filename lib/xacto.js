/* 
 TODO ins()/upd() should do the sensible thing with multiple records at once
 TODO ins()/sel() etc should accept filenames
 TODO X.$(symname,val) to create symbol
 TODO peach(x,f,{kernels:4})
 TODO apter tree()/leaf(p,c)/deep()/wide()
 TODO copy()
 TODO take()/drop()
 TODO rewrite function source via opt() to optimize each() etc
 TODO mold() opposite of flatten()
 TODO a no-write option (for tests, whatever else)
 TODO cache min/max in vector cols
 TODO memoizer
 TODO aggregate functions
 TODO mmap
 TODO better test set
 TODO figure out callbacks, promises, or await
 TODO websockets pubsub for tables
 TODO http api (server and client)
 TODO compression
 TODO benchmark against loki
 XXX Float32Array output doesn't work

 */

var fs=require('fs'), path=require('path');
var lib=require('./lib'),
		backend=require('./backend'),
		coltypes=require('./coltypes'),
		enumeration=require('./enumeration'),
		filehandlers=require('./filehandlers');

function xacto(home,options) {
	let X=this;
	
	X.vecSize=2048; 
	X.home=home?path.join(home,''):'.';
	X.tbl={};
	X.options=options;
	X=lib.install(X);
	X=filehandlers.install(X);
	X=coltypes.install(X);
	X=backend.install(X);
	X=enumeration.install(X);

	if(!fs.existsSync(X.home)) fs.mkdirSync(X.home);

	return X;
}

module.exports=xacto;

