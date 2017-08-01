const X=require('../xacto')();
const f=X.proj(function(a,b,c){return a+','+b+','+c},'Tom',X.U,'Tyler')
X.assert(X.emit(f('Arca'))==='Tom,Arca,Tyler','assert 0')
X.emit('done')

