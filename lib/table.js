// Tables and backends
module.exports = {install: function(X) {

	// Generic table
	
	function table(name, schema, plugins) {
		const tmp=lookup(name);
		if(tmp) return tmp;

		let $={name: name, plugins: [], ops:{}, start:now(), _len:0};
		X.tbl[name]=$;

		function _proxy(op, val) {
			//console.log('proxy', op, val);
			let ops=$.ops[op];
			for(let i=ops.length-1; i>=0; i--) {
				let r=ops[i](val);
				if(r!==U) return r;
			}
			return U;
		}
		$.get = proj(_proxy,'get');
		function ins(val) {
			let id=$._len++;
			_proxy('ins',val);
			return id;
		} $.ins = ins;
		function len() { 
			return $._len; 
		} $.len = len;
		function load(fn) {
			$._len = _proxy('load', fn);
		} $.load = load;
		$.save = proj(_proxy, 'save');
		function sel(clauses) {
			if(clauses===X.U) { // no arg = all rows - handle this here
				let r=[];
				for(let i=0; i<$._len; i++) r.push($.get(i));
				return r;
			}
			return _proxy('sel',clauses);
		} $.sel=sel;
		$.set = proj(_proxy,'set');

		const oplist=['get','ins','len','load','save','sel','set','upd'];
		each(oplist,function(k) { $.ops[k]=[]; });
		for (let i in plugins) {
			let p=lookupdie(plugins[i],'table')($, name, schema);
			$.plugins.push(p);
			each(oplist, function(op){ if(op in p) $.ops[op].push(p[op]); });
		}
		return $;
	}
	X.table=table;

	// Memory table

	function mem(tbl, name, schema) {
		tbl.cols={};
		for(let k in schema) {
			let v=schema[k];
			v=lookupdie(v,'mem');
			tbl.cols[k]=v();
		}
		let $ = {
			'get':function(i) {
				let r={};
				for(let k in tbl.cols) { r[k]=tbl.cols[k].get(i); }
				return r;
			},
			'ins':function(val) {
				let first=0,r=U;
				for(let k in val) { 
					if(!k in tbl.cols) return err('key','mem.ins',k); 
					let v=val[k];
					r=tbl.cols[k].ins(v);
				}
				return r;
			},
			'len':function() {
				return first(tbl.cols).len();
			},
			'load':function(fn) {
				if(!fn) fn=X.homefile(ue(name));
				let fns = each(tbl.cols, function(col,k) { 
					return col.load(fn+"."+k);
				});
				return $.len();
			},
			'save':function(fn) {
				if(!fn) fn=X.homefile(ue(name));
				return each(tbl.cols, function(col,k) { 
					return col.save(fn+"."+k);
				});
			},
			'sel':function(clauses) {
				let t=X.t(clauses), r=[], i;
				if(t=='object') {
					for(let k in clauses) {
						if(!k in tbl.cols) return err('key','mem.sel',k); 
						let col=tbl.cols[i], v=clauses[k], r=col.sel(v);
					}
					return 'none';
				} else if(t=='array') {
					for(let i in clauses) r.push($.sel(clauses[i])); return r;
				} else if(t=='int') return emit($.get(clauses),'intsel');
				else return undefined;
			},
			'set':function(row,val) {
				for(let k in val) { 
					if(!has(k)) return err('key','mem.set',k); 
					tbl.vals[i].set(row, obj[k]);
				}
				return obj;
			}
		}
		return $;
	}
	X.mem=mem;

	// Logger

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
}}
