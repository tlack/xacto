let X=require('../xacto')();

let data=X.range(0,3,function(){return [X.rand(100,1000), X.rand(['bob','jim','sam','frodo','bobo','blarf'])]});
let data2=xjd(xje(data));
console.log('1', data);
console.log('2', data2);
assert(data.length==data2.length,'xje simple');

data=[1, 2, function(x){return x+23}, 4];
data2=xje(data);
emit(data2);

data=xjd(data2);
console.log(data);
emit(data[2]());

data=[1, 2, function(){return 23}, 4];
emit(xje(data));

emit('done');


