// Memory table
module.exports={install:function(X) {
	function mem(tbl, name, schema) {
		tbl.colmap=new Map();
		for(let k in schema) {
			const v=schema[k];
			tbl.colmap.set(k,lookupdie(v,'mem.coltype')());
		}
		function eachString(s) {
			const len=tbl._len; let r=[], rr, i=0;
			for(i=0; i<len; i++) {
				rr=getOne(i); r.push(rr[s]);
			}
			return r;
		}
		function whereAll() {
			const len=tbl._len; let r=[],i=0;
			for(i=0; i<len; i++) r.push(i);
			return r;
		}
		function whereArray(clauses) {
			const cl=clauses.length; let ids=[], r, i;
			for(i=0; i<cl; i++) r.push($mem.where(clauses[i])); 
			return r;
		}
		function whereFunc(clausef) {
			const len=tbl._len; let r=[], i; 
			for(i=0; i<tbl._len; i++) {
				const row=$mem.get(i);
				if(clausef(row, i)) r.push(i);
			}
			return r;
		}
		function whereObj(clauses) {
			const keys=Object.keys(clauses); let ids=[], r, i, j; 
			for(i=0; i<keys.length; i++) {
				const col=tbl.colmap.get(keys[i]);
				const v=clauses[keys[i]], r=col.where(v);
				if(ids.length===0) ids=r; else ids=inter(ids,r);
			}
			return ids;
		}
		function getOne(rownum) {
			//let ids=[], r, i;
			//for(i=0; i<cl; i++) r.push($mem.where(clauses[i])); 
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
		function insObj(val) {
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
		}
		let $mem = {
			'each':function each(f, opts) {
				const len=tbl._len; let r=[],i=0;
				if(typeof(f)==='string') return eachString(f);
				else {
					for(i=0; i<len; i++) r.push(f(getOne(i), i, opts, i));
					return r;
				}
			},
			'get':function(rownum) {
				if(tarray(rownum)) return getMany(rownum);
				else return getOne(rownum);
			},
			'ins':function(val) {
				const tval=t(val);
				if(tval==='object') return insObj(val);
				else return err('type','mem.ins',val);
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
				const ids=$mem.where(clauses);
				return $mem.get(ids);
			},
			'set':function(row,val) {
				for(let k in val) { 
					if(!has(k)) return err('key','mem.set',k); 
					tbl.vals[i].set(row, obj[k]);
				}
				return obj;
			},
			'where':function(clauses) {
				let ids=[], r=[], i;
				if(clauses===X.U) return whereAll();
				if(tarray(clauses)) return whereArray(clauses);
				const t=X.t(clauses);
				if(t==='int') return [clauses];
				else if(t==='object') return whereObj(clauses);
				else if(t==='func') return whereFunc(clauses);
				else return undefined;
			}
		}
		return $mem;
	}
	X.mem=mem;
	return X;
}}

