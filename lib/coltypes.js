module.exports={install: function(X){
	function container() { // regular JS value
		const U=X.U;
		let $v=[], $={};
		function _mkfn(f) { return f+'.json'; }
		function cast(val) { return val; } $.cast=cast;
		function wherefunc(clause,r) {
			for(i=0; i<vl; i++) if(clause($v[i], i, $v)) r.add(i);
			return r;
		}
		function whereval(clause,r) {
			const vi=$v.indexOf.bind($v);
			let last=0;
			while((i = vi(clause, last)) !== -1) {
				r.add(i); last=i+1;
			}
			return r;
		}
		function where(clause,cb) {
			const vl=$v.length;
			let i, r=new Set();
			if(clause===U) return $v;
			if(X.tfunc(clause)===true) wherefunc(clause,r);
			else whereval(clause,r);
			return Array.from(r);
		} $.where=where;
		function get(i,dfl) { 
			if(X.tarray(i)===true) {
				const ilen=i.length;
				let r=[], ii;
				for(ii=0; ii<ilen; ii++) r.push($v[i[ii]]);
				return r;
			} else 
				return $v[i] || dfl; 
		} $.get=get;
		function ins(x) { $v.push(x); return $.length-1 } $.ins=ins;
		function len() { return $.length; } $.len=len;
		function load(fn) { $v=X.load(_mkfn(fn)); } $.load=load;
		function save(fn) { const f=_mkfn(fn); X.save(f,$v); return f; } $.save=save;
		function sel(clause) { return $.get($.where(clause)); } $.sel=sel;
		function set(i,v) { $v[i]=v; return v; } $.set=set;
		return $;
	}
	function vector(proto) { // typedarray wrapper
		const U=X.U;
		let $vec={i:0, n:X.vecSize, v:new proto(X.vecSize)};
		function _mkfn(fn) {
			return [fn+'.json',fn+'.'+proto.name+'.bin'];
		}
		function cast(val) {
			let tval=X.t(val);
			if(tval==='string') return parseFloat(val);
			else if(typeof val!='number') return err('type','cast',val);
			else return val;
		} $vec.cast=cast;
		function wherefunc(clause,retvals) {
			const $i=$vec.i, rv=retvals?true:false;
			let i,r=[];
			for(i=0; i<$i; i++) if(clause($vec.v[i],i)) r.push(rv?$vec.v[i]:i);
			return r;
		}
		function whereval(clause,retvals) {
			const $i=$vec.i, rv=retvals?true:false;
			let r=[], i;
			for(i=0; i<$i; i++) if(clause===$vec.v[i]) r.push(rv?$vec.v[i]:i);
			return r;
		}
		function where(clause,retvals) {
			if(clause===U) return Array.from($vec.v);
			else if(X.tfunc(clause)) return wherefunc(clause, retvals);
			else return whereval(clause, retvals);
		} $vec.where=where;
		function getarray(idxs,dfl) {
			const idxlen=idxs.length;
			let i,r=Array(idxlen);
			for(i=0;i<idxlen;i++) r[i]=$vec.v[idxs[i]];
			return r;
		}
		function get(i,dfl) {
			if(X.t(i)=='array') return getarray(i,dfl);
			if(i>=$vec.i) return dfl; else return $vec.v[i];
		} $vec.get=get;
		function ins(x) {
			const xx=cast(x);
			if($vec.i >= $vec.n) size($vec.i + 2); // fudge factor
			$vec.v[$vec.i] = xx;
			return $vec.i++;
		} $vec.ins=ins;
		function len() { return $vec.i; } $vec.len=len;
		function load(fn) { 
			const f=_mkfn(fn);
			const meta=X.load(f[0]);
			if(!meta) return err('value','load',f[0]);
			$vec.i=meta.i; $vec.n=meta.n;
			$vec.v=new proto(X.load(f[1])); 
			//emit($vec.v,'load2');
			return $vec; 
		} $vec.load=load;
		function save(fn) {
			const f=_mkfn(fn);
			// emit([proto,f,$vec.n,$vec.v.BYTES_PER_ELEMENT],'vec save');
			X.save(f[0], {i:$vec.i, n:$vec.n});
			X.save(f[1], $vec.v);
			return fn+'.json';
		} $vec.save=save;
		function sel(clause) {
			return $vec.get($vec.where(clause));
		} $vec.sel=sel;
		function set(i, val) {
			const vv=cast(val);
			if(i>$vec.n) size(i);
			if(i>$vec.i) $vec.i=i;
			$vec.v[i]=vv; return vv;
		} $vec.set=set;
		function size(n) {
			const newN=blockup(n), nv=new proto(newN); 
			nv.set($vec.v); 
			$vec.n=newN; $vec.v=null; $vec.v=nv;
		} $vec.size=size;
		return $vec;
	}
	console.log(X);
	const _vec=X.proj(X.proj, vector);
	X['byte']=_vec(Uint8Array);
	X['sbyte']=_vec(Int8Array);
	X['int']=_vec(Uint32Array);
	X['sint']=_vec(Int32Array);
	X['long']=_vec(Uint32Array);
	X['slong']=_vec(Int32Array);
	//X['float']=_vec(Float64Array);
	X['float']=X.proj(container);
	X['string']=X.proj(container);
	return X;
}}
