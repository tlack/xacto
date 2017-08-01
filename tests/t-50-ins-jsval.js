let X=require('../xacto')();
let data=[1,2,3,4]
let output=X.ins(data,5)
console.log(output);
X.assert(output.length == 5 && X.emit(X.head(output),'head')==1 && X.emit(X.tail(output),'tail')==5,'ins');
X.emit(output,'t4');
X.emit('done');
