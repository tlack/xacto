const X=require('../xacto')();
let data=X.imp("tom,38,human\narca,4,dog\ntyler,4,human","csv");
X.emit(data, 'data');
X.emit(X.flip(data), 'flipped');
X.emit('done');

