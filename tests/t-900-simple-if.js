/*

results: === 0.5% faster
.. on kaby lake i7 laptop

{ imp: [Function: dfl_imp],
  exp: [Function: dfl_exp],
  load: [Function: dfl_load],
  save: [Function: dfl_save] }
array size 10000000
creations 100
search reps 500
creating array { iterations: 100,
  out: undefined,
  time: 53068,
  periter: 530.68,
  mem:
   { rss: '587mb',
     heapTotal: '590mb',
     heapUsed: '575mb',
     external: '1mb' } }
8299134 0
1880386 0
2067141 1
8655298 1
4710542 0
4601216 1
3683736 0
44218 0
5026252 1
705590 0
search === { iterations: 500,
  out: 4998108,
  time: 111732,
  periter: 223.464,
  mem:
   { rss: '-234mb',
     heapTotal: '-240mb',
     heapUsed: '-256mb',
     external: '0mb' } }
search == { iterations: 500,
  out: 4998108,
  time: 112284,
  periter: 224.568,
  mem:
   { rss: '531mb',
     heapTotal: '530mb',
     heapUsed: '534mb',
     external: '0mb' } }
search general { iterations: 500,
  out: 4998108,
  time: 113046,
  periter: 226.092,
  mem:
   { rss: '-178mb',
     heapTotal: '-178mb',
     heapUsed: '-178mb',
     external: '0mb' } }

*/

const X=require('../xacto')();
const NBUILDS = 100;
const NREPS = 500;
const NROWS = 1000 * 1000 * 10;

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
	let rr=[];
	for (i=0; i<NROWS; i++) if(r[i] === 1) rr.push(i);
	return len(rr);
}, NREPS, 'search ===');

X.time(function() {
	let rr=[];
	for (i=0; i<NROWS; i++) if(r[i] == 1) rr.push(i);
	return len(rr);
}, NREPS, 'search ==');

X.time(function() {
	let rr=[];
	for (i=0; i<NROWS; i++) if(r[i]) rr.push(i);
	return len(rr);
}, NREPS, 'search general');
