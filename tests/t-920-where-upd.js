/*

non-callback version almost twice as fast, not surprising

array size 5000000
creations 100
search reps 300
creating array { iterations: 100,
  out: undefined,
  time: 25194,
  periter: 251.94,
  mem:
   { rss: '405mb',
     heapTotal: '405mb',
     heapUsed: '392mb',
     external: '1mb' } }
3673434 1
3724053 1
4146391 0
2518617 0
362410 0
3627725 0
152865 0
4830957 0
165608 1
2298083 0
where(r,f) { iterations: 300,
  out: 2499092,
  time: 79024,
  periter: 263.41333333333336,
  mem:
   { rss: '107mb',
     heapTotal: '106mb',
     heapUsed: '108mb',
     external: '0mb' } }
where(r,f,upd) { iterations: 300,
  out: 2499092,
  time: 124343,
  periter: 414.4766666666667,
  mem:
   { rss: '-186mb',
     heapTotal: '-188mb',
     heapUsed: '-204mb',
     external: '0mb' } }

*/

const X=require('../xacto')();
const NBUILDS = 100;
const NREPS = 300;
const NROWS = 1000 * 1000 * 5;

let i;
let r=[];

emit(NROWS, 'array size');
emit(NBUILDS, 'creations');
emit(NREPS, 'search reps');

time(function() {
	let rr=[];
	for (i=0; i<NROWS; i++) rr.push(X.rand(2));
	r=rr;
}, NBUILDS, 'creating array');

for (i=0; i<10; i++) {
	let n=X.rand(NROWS);
	emit(r[n], n);
}

function f(row) { return row === 1; }

time(function() {
	const	rr=X.where(r, f);
	return len(rr);
}, NREPS, 'where(r,f)');

time(function() {
	let rr=[];
	const insf=X.ins(rr);
	const out=X.where(r, f, insf);
	return len(rr);
}, NREPS, 'where(r,f,upd)');


