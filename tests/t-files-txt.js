let fs=require('fs');
let X=require('../xacto')();
let data=['hello','there'];
fs.writeFileSync('test.txt',data.join("\n"));
let res=X.load('test.txt');
console.log(data);
console.log(res);
assert(X.equal(res,data),'t2 txt equal');
data=range(0,500,function(){return [X.rand(100,1000), X.rand(['bob','jim','sam','frodo','bobo','blarf'])]});
X.save('test.txt',data);
res=X.load('test.txt');
emit(data);
emit(res);
X.assert(X.equal(res,data),'t2 txt equal 2');
emit('done');



