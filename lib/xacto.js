/* 
 general:

 TODO figure out master plan re: callbacks, promises, or await
 TODO ins()/upd() should do the sensible thing with multiple records at once
 TODO ins()/sel() etc should accept filenames
 TODO X.$(symname,val) to create symbol - think more about role of tagged objects in general
 TODO peach(x,f,{kernels:4})
 TODO apter tree([c1,c2,c3,c4])/leaf(p,c)/wide()
 TODO copy()
 TODO rewrite function source via opt() to optimize each() etc
 TODO memoizer
 TODO mold() opposite of flatten()
 TODO load() http client
 TODO compression
 TODO better test set
 XXX Float32Array output doesn't work

 db issues:

 TODO a no-write option (for tests, whatever else)
 TODO cache min/max in vector cols
 TODO aggregate functions
 TODO computed views
 TODO mmap
 TODO websockets pubsub for tables
 TODO http api server 
 TODO benchmark against loki

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

