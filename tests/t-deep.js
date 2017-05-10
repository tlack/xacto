let X=require('../xacto')();
let z=['tom',23,'bob',function(){return 999}];
let z1=X.deep(z,function(val, path, options, tree) {
	if (X.t(val)=='string') return val.toUpperCase();
	else return val;
});
// console.log(z1);
assert(z1[0]==='TOM' && z1[2]==='BOB','deep test 1');
let z2=X.deep(z,function(v) { return emit(v*3,'zd'); },{type:'int'});
console.log(z2);
assert(z2[1]==69 && z2[0]==='TOM' && z2[2]==='BOB','deep test 2');

let z3=X.deep([ ['tom', 'dick', 30], [ ['bob'], 20], [ [ ['sam'], [1,2,3], 'lol']] ], function(s) { return s.toUpperCase(); }, {type:'string'});
console.log(z3);

emit('done');
