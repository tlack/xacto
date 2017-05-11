//
// Tables and backends
//

module.exports = {install: function(X) {
	const U=X.U;

	// Generic table	
	function table(name, schema, backends) {
		if(backends===X.U) backends=[X.mem];
		const tmp=lookup(name);
		if(tmp) return tmp;

		let $={name: name, backends: [], ops:{}, start:now(), _len:0};
		X.tbl[name]=$;

		function _proxy(op, val) {
			const ops=$.ops[op], oplen=ops.length-1;
			let r, i;
			for(i=oplen; i>=0; i--) { // proxy operation to last backend first - this allows caching
				r=noemit(ops[i],'proxyop')(val);
				if(r!==U) return r;
			}
			return U;
		}
		$.exec = proj(_proxy,'exec');
		$.get = proj(_proxy,'get');
		function ins(val) {
			if(!tdict(val)) return err('value','ins','can only insert dictionaries');
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
			return _proxy('sel',clauses);
		} $.sel=sel;
		$.set = proj(_proxy,'set');

		const oplist=['get','ins','len','load','save','sel','set','upd'];
		each(oplist,function(k) { $.ops[k]=[]; });
		for (let i in backends) {
			let p=lookupdie(backends[i],'table')($,name,schema);
			$.backends.push(p);
			each(oplist, function(op){ if(op in p) $.ops[op].push(p[op]); });
		}
		return $;
	}
	X.table=table;

	// Memory table

	function mem(tbl, name, schema) {
		tbl.colmap=new Map();
		for(let k in schema) {
			const v=schema[k];
			tbl.colmap.set(k,lookupdie(v,'mem.coltype')());
		}
		function execAll() {
			const len=tbl._len; let r=[],i=0;
			for(i=0; i<len; i++) r.push(i);
			return r;
		}
		function execArray(clauses) {
			const cl=clauses.length; 
			let ids=[], r, i;
			for(i=0; i<cl; i++) r.push($mem.exec(clauses[i])); 
			return r;
		}
		function execFunc(clausef) {
			const len=tbl._len;
			let r=[], i; 
			for(i=0; i<tbl._len; i++) {
				const row=$mem.get(i);
				if(clausef(row, i)) r.push(i);
			}
			return r;
		}
		function execObj(clauses) {
			let ids=[], r, i, j; 
			// ids=new Set();
			const keys=Object.keys(clauses);
			for(i=0; i<keys.length; i++) {
				const col=tbl.colmap.get(keys[i]);
				const v=clauses[keys[i]], r=col.exec(v);
				if(ids.length===0) ids=r;
				else ids=inter(ids,r);
			}
			return ids;
		}
		function getOne(rownum) {
			//let ids=[], r, i;
			//for(i=0; i<cl; i++) r.push($mem.exec(clauses[i])); 
			let r={};
			for(let [k,v] of tbl.colmap.entries()) r[k]=v.get(rownum); 
			return r;
		}
		function getMany(ids) {
			const len=ids.length;
			let r=new Array(len), en=tbl.colmap.entries(), row, i;
			for(i=0;i<len;i++) r[i]={};
			for(let [k,v] of tbl.colmap.entries()) {
				row=v.get(ids);
				for(i=0;i<len;i++) r[i][k]=row[i];
			}
			return r;
		}
		let $mem = {
			'exec':function(clauses) {
				let ids=[], r=[], i;
				if(clauses===X.U) return execAll();
				if(tarray(clauses)) return execArray(clauses);
				const t=X.t(clauses);
				if(t==='int') return [clauses];
				else if(t==='object') return execObj(clauses);
				else if(t==='func') return execFunc(clauses);
				else return undefined;
			},
			'get':function(rownum) {
				if(tarray(rownum)) return getMany(rownum);
				else return getOne(rownum);
			},
			'ins':function(val) {
				const valkeys=Object.keys(val), vklen=valkeys.length;
				const cmap=tbl.colmap;
				let r=U, c, i;
				for(i=0; i<vklen; i++) { 
					const k=valkeys[i], vk=val[k];
					c=cmap.get(k);
					if(!c) return err('key','mem.ins',k); 
					r=c.ins(vk);
				}
				return r;
			},
			'len':function() { return first(tbl.colmap).len() },
			'load':function(fn) { // TODO make this use a file handler for the whole table
				if(!fn) fn=X.homefile(ue(name));
				const fns = each(tbl.colmap, function(col,k) { 
					return col.load(fn+"."+k);
				});
				return $mem.len() },
			'save':function(fn) {
				if(!fn) fn=X.homefile(ue(name));
				return each(tbl.colmap, function(col,k) { 
					return col.save(fn+"."+k);
				}); },
			'sel':function(clauses) {
				const ids=$mem.exec(clauses);
				return $mem.get(ids);
			},
			'set':function(row,val) {
				for(let k in val) { 
					if(!has(k)) return err('key','mem.set',k); 
					tbl.vals[i].set(row, obj[k]);
				}
				return obj;
			}
		}
		return $mem;
	}
	X.mem=mem;

	// Logger

	X.logDflOpts={
		replay:true,
		secs:X.hour(1),
		rows:10 * 1000,
		rotate:1,
		interval:X.second(10)
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

	return X;
}}
