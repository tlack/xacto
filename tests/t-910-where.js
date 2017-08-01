/*


{ imp: [Function: dfl_imp],
  exp: [Function: dfl_exp],
  load: [Function: dfl_load],
  save: [Function: dfl_save] }
array size 1000000
creations 100
search reps 500
creating array { iterations: 100,
  out: undefined,
  time: 4939,
  periter: 49.39,
  mem:
   { rss: '103mb',
     heapTotal: '109mb',
     heapUsed: '95mb',
     external: '1mb' } }
333310 1
713462 0
13356 0
497447 0
897344 1
847994 1
859446 0
45120 1
895581 1
304754 1
where(r,1) { iterations: 500,
  out: undefined,
  time: 17377,
  periter: 34.754,
  mem:
   { rss: '33mb',
     heapTotal: '31mb',
     heapUsed: '30mb',
     external: '0mb' } }
where(r,f) { iterations: 500,
  out: 499993,
  time: 31057,
  periter: 62.114,
  mem:
   { rss: '-18mb',
     heapTotal: '-11mb',
     heapUsed: '-22mb',
     external: '0mb' } }
where(r,function(){...}) { iterations: 500,
  out: 499993,
  time: 31010,
  periter: 62.02,
  mem: { rss: '1mb', heapTotal: '0mb', heapUsed: '0mb', external: '0mb' } }

*/

const X=require('../xacto')();
const NBUILDS = 100;
const NREPS = 500;
const NROWS = 1000 * 1000 * 1;

let i;
let r=[];

X.emit(NROWS, 'array size');
X.emit(NBUILDS, 'creations');
X.emit(NREPS, 'search reps');

X.time(function() {
	let rr=[];
	for (i=0; i<NROWS; i++) rr.push(X.rand(2));
	r=rr;
}, NBUILDS, 'creating array');

for (i=0; i<10; i++) {
	let n=X.rand(NROWS);
	X.emit(r[n], n);
}

X.time(function() {
	let rr=X.where(r, 1);
	return X.len(rr);
}, NREPS, 'where(r,1)');

X.time(function() {
	function f(row) { return row === 1; }
	let rr=X.where(r, f);
	return X.len(rr);
}, NREPS, 'where(r,f)');

X.time(function() {
	let rr=X.where(r, function(row){ return row === 1; });
	return X.len(rr);
}, NREPS, 'where(r,function(){...})');


