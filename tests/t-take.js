var X=require('../xacto')();

let L=[3,6,9,18,1,2,4];

X.assert(X.take(L,1)==3,'take 1');
X.assert(X.equal(X.take(L,2),[3,6]),'take 2');
X.assert(X.equal(X.take(L,99), L), 'take 3');
X.assert(X.equal(X.take(L,-1),[4]),'take 4');
X.assert(X.equal(X.take(L,-2),[2,4]),'take 5');
X.assert(X.head(L)==3,'take 6');
X.assert(X.tail(L)==4,'take 7');
X.assert(X.first(L)==3,'take 8');
X.assert(X.last(L)==4,'take 9');

X.assert(X.take('abcdef',3)=='abc','take string 1');
X.assert(X.take('abcdef',-3)=='def','take string 2');

X.assert(X.equal(X.drop(L,4),[1,2,4]),'drop 1');
X.assert(X.equal(X.drop(L,-4),[3,6,9]),'drop 1');

X.assert(X.drop('abcdef',3)=='def','drop string 1');
X.assert(X.drop('abcdef',-3)=='abc','drop string 2');

emit('done');

