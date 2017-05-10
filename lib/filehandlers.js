//
// Adapters for different file types
//

let fs=require('fs');

module.exports = {install: function filehandlers(X) {
	function read(fn,cb,parse,opts){
		parse=parse ? parse : X.identity;
		let finalcb=cb;
		if (cb) finalcb=function(err,data) {
			if(!err) data=parse(data);
			oldcb(err,data);
		};
		return (cb?fs.readFile:parse(fs.readFileSync))(fn,opts,finalcb); 
	}
	function write(fn,x,cb,opts){ return (cb?fs.writeFile:fs.writeFileSync)(fn,x,opts,cb); }
	function load(fn,cb){ return read(fn,cb); }
	function save(fn,x,cb){ return write(fn,x,cb); }
	let imp = X.identity, exp=X.identity;
	X.fileHandlers={};
	var dfl={'imp':imp, 'exp':exp, 'load':load, 'save':save};
	X.fileHandlers.default=dfl;
	X.fileHandlers['json']=Object.assign(dfl, {
		'exp':function(x){return je(x)},'imp':function(x){return jd(x)}
	});
	X.fileHandlers['bin']=Object.assign(dfl,{
		'save':function(fn,x,cb){return write(fn,new Buffer(x),cb)}
	});
	X.fileHandlers['txt']=Object.assign(dfl,{
		'exp':function(x){return tarray(x) ? x.join("\n") : x},
		'imp':function(x){return x.split("\n")},
		'load':function(fn,x,cb){return this.imp(read(fn,cb,X.identity,'utf-8'))},
		'save':function(fn,x,cb){return write(fn,this.exp(x),cb,'utf-8')}
	});
	return X;
}}


