module.exports=function loggerinit(X) {
	X.logDflOpts={
		replay:true,
		secs:X.hour(1),
		rows:10 * 1000,
		rotate:1,
		interval:X.sec(10)
	};
	function logger(opts) {
		let o=Object.assign(X.logDflOpts,opts);
		let $={tbl:U, o:o, dologging: 1, last: 0, timer:U, v:[]};
		let ext='.log.json';
		function fn(t) {
			return X.homefile(Math.round(t/o.rotate).toString()+ext);
		}
		function logcheck() {
			const t=X.now(), vl=$.v.length;
			if (vl && (vl > $.o.rows || t-$.last > $.o.secs)) {
				time(function(){X.save(emit(fn(t),'log.save.fn'), $.v)},1,'log.save.t');
				$.o.last=t; $.v=[];
			}
		}
		$.check=logcheck;
		function appender(type) {
			return function(val) { if ($.dologging) $.v.push([$.tbl.name,type,val]); }
		}
		$.ins=appender('ins');
		$.upd=appender('upd');
		function replay() {
			const fns=fs.readdirSync(home);
			each(fns,function(fn) {
				if(fn.substr(-1*ext.length)==ext) {
					fn=path.join(X.home,fn);
					let data=X.load(emit(fn,'replay.file'));
					let start=now(), n=0;
					$.dologging=0;
					each(data,function(row) {
						//emit(row,'replay.row');
						//emit(X.tbl);
						let t=X.tbl[row[0]];
						if(!t) throw err('value','replayrow.table',row);
						let op=t[row[1]];
						if(!op) throw err('value','replayrow.op',row);
						op(row[2]);
						n++;
					});
					delete data;
					$.dologging=1;
					let end=now();
					fs.unlinkSync(fn);
					emit([end-start,n],'replay.summary');
				}
			});
		}
		if (o.interval) $.timer=setInterval($.check.bind(this),o.interval); 
		return emit(function(tbl, name, schema) {
			$.tbl=tbl;
			if($.o.replay) replay();
			return $;
		},'logger');
	}
	X.logger=logger;
}
