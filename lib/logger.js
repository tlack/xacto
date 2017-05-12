// Logger

const fs=require('fs'), path=require('path');

module.exports={install:function(X){
	X.logDflOpts={
		replay:true,
		flush:{
			interval:X.second(1),
			rows:100
		},
		rotate:1,
		interval:X.second(1),
		unlink:false,
		verbose:false
	};
	function logger(opts) {
		let o=Object.assign({},X.logDflOpts,opts);
		let $={tbl:U, o:o, dologging: 1, logStats:[], lastFlush: 0, timer:U, v:[]};
		let ext='.log.json';
		function emit(x,y) {
			if ($.o.verbose) return X.emit(x,y);
			else return x;
		}
		function fn(t) {
			return emit(X.homefile(Math.round(t/o.rotate).toString()+ext),'fn');
		}
		function flush() {
			// XXX, should have a smarter way to structure these logs - numeric indices?
			const t=X.now();
			const lfn=emit(fn(t),'flush.fn'), nrecs=emit(len($.v),'flush.nrecs');
			X.save(lfn, $.v);
			$.o.lastFlush=t; $.v=[];
		}
		function logcheck() {
			const t=X.now(), vl=$.v.length;
			emit(t,'logcheck');
			if (vl && (vl >= $.o.rows || t-$.lastFlush > $.o.flush.interval)) flush();
		}
		$.check=logcheck;
		function appender(type) {
			return function(val) { if ($.dologging) $.v.push([$.tbl.name,type,val]); }
		}
		$.ins=appender('ins');
		$.upd=appender('upd');
		function loadLog(fn) {
			fn=path.join(X.home,fn);
			let data=emit(X.load(emit(fn,'loadLog.file')),'loadLog.data');
			let start=now(), tableStats={}, n=0;
			$.dologging=0;
			each(data,function(row) {
				//emit(row,'replay.row');
				//emit(X.tbl);
				let t=X.tbl[row[0]];
				if(!t) throw err('key','loadLog.table',row);
				let op=t[row[1]];
				if(!op) throw err('key','loadLog.op',row);
				op(row[2]);
				n++;
			});
			delete data;
			$.dologging=1;
			let end=now();
			if ($.o.unlink) fs.unlinkSync(fn);
			emit(X.ins($.logStats, {fn:fn,elapsed:end-start,nrows:n}),'replay.summary');
		}
		function replay() {
			emit('replay()');
			const fns=fs.readdirSync(home);
			each(fns,function(fn) { // XXX should sort these
				emit(fn,'replay.fn');
				if(fn.substr(-1*ext.length)==ext) loadLog(fn);
			});
		}
		if (o.interval) $.timer=setInterval($.check.bind(this),o.interval); 
		emit(opts,'logger.boot');
		return function(tbl, name, schema) {
			emit('logger.startf');
			$.tbl=tbl;
			if($.o.replay) replay();
			return $;
		};
	}
	X.logger=logger;
	return X;
}};
