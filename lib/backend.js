// tables, backends, and such

const fs=require('fs'), path=require('path');

module.exports = {install: function(X) {
	const U=X.U;

	// Generic table	
	function table(name, schema, backends) {
		if(backends===X.U) backends=[X.mem];

		if (name) {
			const tmp=lookup(name);
			if(tmp) return tmp;
		} else name='';

		let $={name: name, backends: [], ops:{}, start:now(), _len:0};

		if (name) X.tbl[name]=$;

		function _proxy(op, val, val2) { // call op(val) for each of the backend handlers
			const ops=$.ops[op], oplen=ops.length-1;
			let r, i;
			for(i=oplen; i>=0; i--) { // proxy operation to last backend first - this allows caching
				r=noemit(ops[i],'proxyop')(val, val2);
				if(r!==U) return r;
			}
			return U;
		}
		$.each = proj(_proxy,'each');
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
		function upd(clauses,val) {
			emit([clauses,val],'upd');
			return _proxy('upd',clauses,val);
		} $.upd=upd;
		function where(clauses) {
			return _proxy('where',clauses);
		} $.where=where;
		$.set = proj(_proxy,'set');

		const oplist=['each','get','ins','len','load','save','sel','set','upd','where'];
		each(oplist,function(k) { $.ops[k]=[]; });
		for (let i in backends) {
			let p=lookupdie(backends[i],'table')($,name,schema);
			$.backends.push(p);
			each(oplist, function(op){ if(op in p) $.ops[op].push(p[op]); });
		}
		return $;
	}
	X.table=table;


	return X;
}}
