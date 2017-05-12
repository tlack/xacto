module.exports = {install: function filehandlers(X){

	function csv_join0(val) {
		return err('nyi','csv_join0',val);
	}
	function csv_join(vals) {
		return X.each(vals, csv_join0).join("\n");
	}
	function csv_split0(line) {
		emit(line,'csv_split0');
		return line.split(",");
	}
	function csv_split(lines) {
		emit(lines,'csv_split');
		return X.each(lines.split(/\r?\n/), csv_split0);
	}
	let dfl=X.handlers['default'];
	console.log(dfl);
	X.handlers['csv']={
		'exp':function(x,cb,opts){
			let val=csv_join(x);
			return dfl.exp(val, cb, opts);
		},
		'imp':function(x,cb,opts){
			emit(cb,'imp cb');
			emit(x,'csv.imp');
			let val=csv_split(x);
			emit(val,'csv.imp val');
			if(opts!==X.U && opts.tableCols!==X.U) {
				const vl=len(val), tc=opts.tableCols;
				let i;
				let t=X.table('',tc);
				for(i=0; i<vl; i++) t.ins(dict(tc,val[i]));
				return t;
			} else return dfl.imp(val, cb, opts);
		},
		'load':function(fn,x,cb){return dfl.read(fn,cb,this.imp,'utf-8')},
		'save':function(fn,x,cb){return dfl.write(fn,this.exp(x),cb,'utf-8')}
	};
	return X;
}}

