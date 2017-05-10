module.exports={install: function X(X){
	function xje(x) { 
		emit(x,'xje');
		return je(deep(x,xje0,{type:'func'}));
	}
	function xje0(x,path,opts) {
		emit([x,path,opts],'xje0');
		return {'$func':x.toString()};
	}
	function xjd0(x,path,opts) {
		emit([x,path,opts],'xjd0');
		return new Function(x);
	}
	function xjd(x) {
		emit(x,'xjd');
		const jdx=jd(x);
		emit(jdx,'xjd jdx');
		return deep(jdx,xjd0,{key:'$func'});
	}
	X.xje=xje;
	X.xjd=xjd;
}}


