const X=require('../xacto')();
let data=X.imp("tom,38,human\narca,4,dog\ntyler,4,human","csv");
emit(data, 'data');
emit(X.flip(data), 'flipped');
emit('done');

