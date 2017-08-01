//
// Adapters for different file types
//
let fs=require('fs');
module.exports = {install: function filehandlers(X){
	function dfl_read(fn,cb,parse,opts){
		parse=parse ? parse : X.identity;
		let finalcb=cb;
		if (cb) finalcb=function(err,data) {
			if(!err) data=parse(data);
			oldcb(err,data);
		};
		return (cb?fs.readFile:parse(fs.readFileSync))(fn,opts,finalcb); 
	}
	function dfl_write(fn,x,cb,opts){ 
		return (cb?fs.writeFile:fs.writeFileSync)(fn,x,opts,cb); 
	}
	function dfl_load(fn,cb,opts){ return dfl_read(fn,cb,X.U,opts); }
	function dfl_save(fn,x,cb,opts){ return dfl_write(fn,x,cb,opts); }
	function dfl_imp(str, cb, opts) {
		if (cb!==X.U) return cb(str, opts); else return str;
	}
	function dfl_exp(value, cb, opts) {
		if (cb!==X.U) return cb(value, opts); else return value;
	}
	X.handlers={};
	var dfl={'imp':dfl_imp, 'exp':dfl_exp, 'load':dfl_load, 'save':dfl_save};
	X.handlers.default=dfl;
	X.handlers['json']=Object.assign({},dfl,{
		'exp':function(x){return je(x)},'imp':function(x){return jd(x)},
		'load':function(fn,x,cb){return this.imp(dfl_read(fn,cb,X.identity,'utf-8'))},
		'save':function(fn,x,cb){return dfl_write(fn,this.exp(x),cb,'utf-8')}
	});
	X.handlers['bin']=Object.assign({},dfl,{
		'save':function(fn,x,cb){return dfl_write(fn,new Buffer(x),cb)}
	});
	X.handlers['txt']=Object.assign({},dfl,{
		'exp':function(x,cb,opts){
			let val=X.tarray(x) ? x.join("\n") : x;
			return dfl_exp(val, cb, opts);
		},
		'imp':function(x,cb,opts){
			const val=x.split("\n");
			return dfl_imp(val, cb, opts);
		},
		'load':function(fn,x,cb){return this.imp(dfl_read(fn,cb,X.identity,'utf-8'))},
		'save':function(fn,x,cb){return dfl_write(fn,this.exp(x),cb,'utf-8')}
	});
	return X;
}}


