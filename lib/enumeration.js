module.exports={install: function enumerationinit(X) {
	
function enumeration(func) {
	let $grp={_len: 0, func: func, vals:[], idxs:[]}; // cant use Map cuz no je()/jd() :(
	function _mkfn(f) { return f+'.enumeration.json'; }
	function exec(clause,cb) {
		const vals=$grp.vals, vallen=$grp.vals.length;
		let r;
		emit($grp._len, 'enumeration exec len');
		if(clause===U) return range(0,$grp._len);
		else if(t(clause)==='func') {
			for(let i=0; i<vallen; i++) if(clause(vals[i], U, U)) return Array.from($grp.idxs[i]);
		} else {
			for(let i=0; i<vallen; i++) if(clause == vals[i]) return emit($grp.idxs[i].exec(),'grp exec');
		}
		return [];
	} $grp.exec=exec;
	function get(i,dfl) { 
		let tricky=0;
		if(!tarray(i)) { tricky=1; i=[i]; }
		const ilen=i.length;
		let r=[], idx;
		const idxs=$grp.idxs, idxlen=idxs.length;
		for(let j=0; j<idxlen; j++) {
			for(ii=0; ii<ilen; ii++) {
				idx=emit(i[ii],'grpgetidx');
				if(idxs[j].exec(idx).length) r.push(emit($grp.vals[j],'grpgetpush'));
			}
		}
		return tricky ? first(r) : r;
	} $grp.get=get;
	function ins(x, _id) {
		emit($grp, 'sloppy $grp');
		emit($grp.idxs, '$grp idxs');
		let id=_id === U ? $grp._len : _id;
		let xf=$grp.func ? $grp.func(x) : x;
		let i=$grp.vals.indexOf(xf);
		emit([$grp.vals,$grp.idxs, i],'grp.ins') ;
		if(i!==-1) $grp.idxs[i].ins(id);
		else {
			$grp.vals.push(noemit(xf,'ins new xf'));
			let v=X['long']();
			v.ins(id);
			$grp.idxs.push(v);
		}
		if (_id === U) $grp._len++;
		return id;
	} $grp.ins=ins;
	function len() { return $grp._len; } $grp.len=len;
	function load(fn) { $grp=Object.assign($grp,X.load(_mkfn(fn))); return $grp.len; } $grp.load=load;
	function save(fn) { const f=_mkfn(fn); X.save(f,$grp); return f; } $grp.save=save;
	function sel(clause) { return $grp.get(emit($grp.exec(clause),'grpselexec')); } $grp.sel=sel;
	function set(i,v) { 
		let j, tmp;
		// if this index exists in one of the enumerations already, remove it
		// for(j=0; j<idxs.length; j++) if((tmp=idxs[j].indexOf(i))!==-1) idxs[j]=idxs[j].splice(tmp, 1);
		ins(v, i);
		return v;
	} $grp.set=set;
	X.emit($grp.idxs, 'idxs test');
	return $grp;
}

X.enumeration=enumeration;
return X;

}}
