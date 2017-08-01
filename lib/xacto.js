/* 
 general:

 TODO split out vector, logger, mem, etc.
 TODO figure out master plan re: callbacks, promises, or await
 TODO ins()/upd() should do the sensible thing with multiple records at once
 TODO ins()/sel() etc should accept filenames
 TODO X.$(symname,val) to create symbol - think more about role of tagged objects in general
 TODO peach(x,f,{kernels:4})
 TODO apter tree([c1,c2,c3,c4])/leaf(p,c)/wide()
 TODO the rest of the Q iters eachleft/eachright/eachpair 
 TODO perms([[x1,x2,x3], [y1,y2]],f) -> [f[x1,y1], f[x1,y2], f[x2,y1], f[x2,y2], f[x3,y1], f[x3,y2]]
 TODO copy()
 TODO mold() opposite of flatten()
 TODO ravel(x, single_func, multi_func?) 
 TODO load() http client
 TODO better test set
 TODO need an expression resolver similar to deep() for symbolic stuff, perhaps resolve(tree, rules)
 TODO join() -> ins(), then new join()/split() to mirror sv/vs
 TODO choice([x,y,z]) -> rand([x,y,z]) 
 TODO probably need an EventThing ugh

 db issues:

 TODO a no-write option (for tests, whatever else)
 TODO cache min/max in vector cols
 TODO aggregate functions
 TODO mmap
 TODO websockets pubsub for tables
 TODO http api server 
 TODO spit polish logger
 TODO bind logger flush to node.js exit event

 speed:

 TODO rewrite function source via opt() to optimize each() etc
 TODO computed views
 TODO memoizer (similar to a view in some ways; explore)
 TODO compression
 TODO CSVs! we may need to dep a very fast loader
 TODO create some trickery to use "Held Values" like Mathematica does
 XXX Float32Array output doesn't work
 TODO look into V8 internals and the less mainstream parts of node to figure out if we can squeeze out more performance for column searches there
 TODO explore child processes using the simpler 'one port per fork' model
 TODO time() should measure memory growth per iter
 TODO standard benchmark suite
 TODO .. and benchmark against loki

 */

var fs=require('fs'), path=require('path');
var lib=require('./lib'),
		table=require('./table'),
		memtable=require('./memtable'),
		logger=require('./logger'),
		coltypes=require('./coltypes'),
		enumeration=require('./enumeration'),
		filehandlers=require('./filehandlers');
		csv=require('./csv');

function xacto(home,options) {
	let X={};
	X.vecSize=2048; 
	X.home=home?path.join(home,''):'.';
	X.tbl={};
	X.options=options;
	X=lib.install(X);
	X=filehandlers.install(X);
	X=coltypes.install(X);
	X=table.install(X);
	X=memtable.install(X);
	X=logger.install(X);
	X=enumeration.install(X);
	X=csv.install(X);

	if(!fs.existsSync(X.home)) fs.mkdirSync(X.home);

	return X;
}

module.exports=xacto;

