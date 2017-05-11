let NROWS=20;
let NITERS=10;
let NTESTRECS=10;

let xacto=require('../xacto');
console.log(xacto);
var X=xacto('testdb/');
let grp=X.enumeration();
grp.ins('abc');
grp.ins('def');
grp.ins('ghi');
grp.ins('abc');
grp.ins('xyz');
X.assert(X.equal(grp.exec(),X.range(0,5)),'enumeration exec');

delete grp;
grp=X.enumeration();

let i,
    names=['tom','arca','bob','cricket','dick','harry','stan'],
		testdata=[];
for(i=0; i<NTESTRECS; i++) {
	testdata.push(X.choice(names)+' '+X.choice(names));
}

X.time(function(n) {
	grp.ins(X.choice(testdata));
}, NROWS, 'ins');

console.log(X.len(grp),NROWS);
X.assert(X.equal(X.sel(grp), grp.sel()), 'enumeration double sel');
console.log(X.sel(grp));
emit(X.sel(grp,X.choice(testdata)),'random sel');
if(X.len(grp)!=NROWS) die('enumeration len');

X.time(function(n) {
	let name=X.choice(testdata);
	let z=emit(grp.sel(name),'search name');
	// console.log(z);
	// console.log(len(grp), z.length, X.je(z));
	if(z.length < NROWS/NTESTRECS/2) die('weird length: '+(z.toString()));
}, 1, 'exec 1');

emit('done');

