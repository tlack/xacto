let X=require('../xacto')();
let data=[1,2,3,4]
let output=X.ins(data,5)
console.log(output);
X.assert(output.length == 5 && emit(X.head(output),'head')==1 && emit(X.tail(output),'tail')==5,'ins');
emit(output,'t4');
emit('done');
