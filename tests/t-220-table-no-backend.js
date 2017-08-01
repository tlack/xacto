const X=require('../xacto')();
const t=X.table('blah',{a:'int',b:'string'})
X.assert(t.backends.length==1, 'mem table didnt take')
X.emit('done')

