const X=require('../xacto')();
X.assert(X.tarray(X.emit(X.each(X.range(20,30),X.identity),'r')),'t-15-each tarray')
X.emit('done')

