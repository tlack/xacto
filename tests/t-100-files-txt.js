const N=100;
let fs=require('fs');
let X=require('../xacto')();
let data=['hello','there'];
fs.writeFileSync('test.txt',data.join("\n"));
let res=X.load('test.txt');
console.log(data);
console.log(res);
assert(X.equal(res,data),'t2 txt equal');
data=range(0,N,function(){return X.rand(['bob','jim','sam','frodo','bobo','blarf'])});
X.save('test.txt',data);
res=X.load('test.txt');
X.assert(X.equal(res,data),'t2 txt equal 2');
emit('done');



