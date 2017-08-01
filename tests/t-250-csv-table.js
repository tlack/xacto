const X=require('../xacto')();
let tbl=X.imp(
	"tom,38,human\narca,4,dog\ntyler,4,human","csv",
	false, 
	{tableCols:{name:'string',age:'int',species:'string'}});
let o=tbl.each('age');
X.emit(o,'age');
X.assert(X.equal(X.emit(tbl.each(function(row){return row.age*2}),'fage'), [76,8,8]), 't-250-csv-table equal each func');
X.assert(X.len(tbl)==3 && X.sum(o)==38+4+4,'t-250-csv-table');
X.assert(X.sum(X.emit(X.each(tbl,'age'),'Xeage')) == 38+4+4, 't-250-csv-table sum each str');
X.emit('done');

