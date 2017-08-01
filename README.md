# xacto

Xacto is a tool for manipulating data with Javascript which is heavily inspired
by the amazing [Q/Kdb](http://kx.com) and Mathematica. It includes a general
utility API and an in-memory database implementation.

Work at a high level, using a uniform set of functions that behave the same way
against different types of in-memory values, files, tables, remote resources
(not yet implemented), etc.

## Status

Pretty new. Some glaring omissions. Don't trust with your important data just yet. See "Bugs" below.

## Motivations

- JavaScript really sucks but we're stuck with it. I want to write JS that's as concise and meaningful as [Q by Kx](http://kx.com). 

- One size does not fit all. As my needs become more complex, I want to tune
	how I store and scan my data. I want to be able to spawn mini-databases and
	hybrids.

- Every external dependency is a risk factor. Remove as many as possible. I
	want to work without MySQL or Redis or 500mb of npms or anything but Node
	itself.

## Features

- Convenience functions that abstract away JavaScript's frustratingly patchy
	standard library and perform in a uniform way for most data types.
- Column-oriented in-memory tables
- Updates logged to disk and replayed at startup
- TypedArray vector columns for integers (byte, short, int)
- Regular Javascript value columns (can contain any type, including other tables)
- Create your own table types
- Create your own column types
- Fast-ish, or at least written with performance in mind
- Regular Javascript-style functions instead of SQL or homegrown query languages.
- No magic or Javascript puffery; simple, concise code, written in a crude but
	familiar style, with minimal state. 
- Zero dependencies (at least for now)
- Not too "objecty" (prototypal inheritance is leading cause of teen suicide)
- Code fairly dense, easy to scan, designed for trendy wide screens

### Speed and brutality

For my own purposes I need this to be pretty fast so that was a primary concern
when designing the system.

- many functions use plain ole for(;;;) - still faster than all those lovely
	callbacks, but makes the code less terse and flexible than I'd like
- uses typed arrays to store integer values (and hopefully floats and other
	types soon; see below)
- uses `Map` instead of objects for table column handling - this should allow for
	tables with almost any number of columns which creates interesting opportunities
- uses `Set` for internal row lists in critical sections

## General API 

Xacto presents a number of handy functions for working with Javascript objects
and pure values.

Goals:

* Use as few global "verbs" as possible - have one understood meaning of each
* Make each verb behave logically for each type of data/collection (find the path of least surprise)
* Add the first level of required sugar to make it edible by humans

Generally, X's verbs take the "data" or "from" thing as the first argument with the
operation or value as the second.

### assert(cond,text)

Dies if !cond showing text

### choice(values)

Returns a random item from `value`.

Value must be a string or array at this time.

### deep(collection, func, opts?)

Deep recursion into `collection`. Applies `func` to every "leaf" value.

Optionally, supply `{type: "string"}` in `opts` to select what kind types
of nodes should have `func` invoked on them.

The collection is returned with the results of `func` inserted in the
place of previous values when it was dispatched.

`func` is called as `f(value, path, opts, collection)`. The path value can be used to
figure out where you are in `collection`. It is an array of indices.

```
> let X=require('../xacto')();
> let z=['tom',23,'bob',function(){return 999}];
> let myfun=function(s){return s.toUpperCase()};
> let z1=X.deep(z,myfun,{type:'string'});
> z1
[ 'TOM', 23, 'BOB', [Function] ]
```

This is useful for recursing deep into objects to find or manipulate specific
values.

### dict(keys, values) 

Creates a keyed object (dictionary) from a list of keys and a list of values.

```
> X.dict(['name','age'],['tom',38])
{name:'tom',age:38}
```

### die(text)

Prints text and exits with error code 1.

### drop(value, n)

Return `value` without the first `n` items.

Negative `n` will remove items from the end of `value`.

```
> const X=require('xacto')();
> const r=X.range(0,10)
> X.drop(r,7)
[7,8,9]
> X.drop(r,-7)
[0,1,2]
```

### emit(value, label?)

Prints value and returns it; use in the middle of expressions to debug values.

```
> let z=emit(get_thing(),'thing result')*4+emit(other_func(),'other')
thing result 6
other 12
36
```

### each(x, f, opts)

For arrays: returns an array of `f(x[i],i,opts)` for each item in x.

```
> X.each(X.range(1, 10+1), function(x){return x*3})
[ 3, 6, 9, 12, 15, 18, 21, 24, 27, 30 ]
```

For objects and Maps, `each` preserves keys. It returns `{k:f(x[k],k,opts), j:f(x[j],j,opts), ...}`:

```
> let rec={name:'Arca',species:'super cute pomeranian'};
> X.each(rec, function(x){return x.toUpperCase()})
{ name: 'ARCA', species: 'SUPER CUTE POMERANIAN' }
```

`each` also works for tables. Starting from a CSV, as a string, just apply some columns to the output:
```
> let cols={name:'string',age:'int',species:'string'};
> let tblConf={tableCols:cols};
> let tbl=X.imp("tom,38,human\narca,4,dog\ntyler,4,human","csv",false,tblConf);
> tbl.each(function(row){return row.age*2})
[ 76, 8, 8 ]
```
In the case of arrays of objects or tables, `each` allows you to specify the
column name instead of a function to extract all values of that column:

```
> X.each(tbl, 'age')
[38, 4, 4]
```

### equal(x, y)

Performs a deep equality test between x and y.

### first(value) 

Synonym for head

### flip(value)

Transform dictionaries with arrays of values (like `{a:[1,2,3],b:[4,5,6]}`) into arrays of flattened
dictionaries (like `[{a:1,b:4},{a:2,b:5},{a:3,b:6}]`).

```
> const X=require('./xacto')()
> const z={'name':['tom','arca','tyler'],age:[38,4*7,4]}
> z
{ name: [ 'tom', 'arca', 'tyler' ], age: [ 38, 28, 4 ] }
> X.flip(z)
[ { name: 'tom', age: 38 },
  { name: 'arca', age: 28 },
  { name: 'tyler', age: 4 } ]
```

### key(value) 

For dictionaries (objects), returns the keys.

For lists, returns an array of its indices.

### get(collection, index)

Return the `index`th item in `collection`. `index` can also be an array. Works for all types.

### handler(filename)

Returns the Xacto handler for a given filename's extension. Mostly used
by `load()` and `save()`.

### has(collection, value)

If `collection` is an object, returns whether or not `value` is one of its properties.

If `collection` is an array or other container, returns whether or not `value` is one of
its members.

Error otherwise.

### head(value)

Returns the first item in value

### ins(collection, value)

Appends `value` to `collection`. This works for tables, arrays, etc.

If `collection` is an object, and it has a member named `ins` that is a
function, this will return `collection.ins(x)`.

If `collection` is an object and `value` is an object each of the values in
`value` will be set in `collection`, overriding previous values with the same
keys.

### inter(x, y)

Intersection. Returns the common values in `x` and `y`.

### member(collection, value)

Membership test. Returns true if `value` is in `collection`.

### last(value)

Synonym for tail

### len(value)

Return the length of `value`. Works for most types, including tables.

If value is an object with a 'len' member, returns `value.len()`.  

If value is an object with a 'length' member or a string, returns value.length

If value is a dictionary, return the number of keys

### load(resource,callback?,options?)

Interpret `resource` and retrieve it, calling `callback(err,data)`
when done.

`resource` is generally a filename. You can define your own handlers to, say,
automatically decode `.json` files when loaded. See the *Resources* section
below for more.

This callback style (error as first arg, result as second) is meant to emulate
the Node.js built in API. The built-in filesystem extension handlers allow you
to supply null as `callback` and invoke their synchronous APIs. This is handy
during server startup and to avoid callback hell when you can spare the
performance.

The meaning of `options` is specific to the resource handler.

See also the converse of this function: `save(resource,data,callback?)`.

### jd(value)

JSON decode

### je(value)

JSON encode

### join(x,y)

Returns x with y appended. 

This might go away in favor of `ins`.

### max(m, n)

Return the higher of m and n

### min(m, n) 

Return the lower of m and n

### proj(func, x?, y?, z?)

Project arguments `x`, `y`, and/or `z` onto function `func`. Returns a new function.

Similar to currying. Returns a version of `func` with arguments already
applied. Use undefined to indicate an empty value that must be applied when
calling the resulting function.

```
> const X=require('./xacto')();
> const pointlessfunc=function(a, b, c){ return 'Hello '+a+', '+b+', '+c },
> const f=X.proj(pointlessfunc,'Tom', undefined, 'Tyler')
> f
[Function: bound ]
> f('Arca')
'Hello Tom, Arca, Tyler'
```

Currently only allows work with functions with three arguments or less.

### rand(n)

Returns a random integer from (0..n]

### range(min, max, func?)

Returns an array of integers from min to max-1.

Optionally calls `func(i)` for each integer. You can use this to apply a range
of numbers to a function, generate test data, etc.

### sel(collection, predicate)

Select the items in `collection` matching `predicate`. Works for most types.
See "Select" below.

### str(x) 

Attempt to stringify `x`. Simple values like numbers become strings. Objects
with a `toString` method, such as a `Buffer`, have it its results returned.
Container types are returned as JSON.

### sum(array, nullvalue?)

Sum array. Numbers only for now. Only arrays for now. 

If `nullvalue` supplied, string conversion will be attempted.

### take(value, n)

Return the first `n` items in `value`.

Negative `n` will return items from the end of `value`.

```
// Xacto currently pollutes globals, so you don't have to use X. in front of verb names
> const r=range(0,10)
> take(r,3)
[0,1,2]
> take(r,-3)
[7,8,9]
```

### tail(value)

Return last item in value

### t(value)

Returns the type of `value`, with some additions over standard `typeof`:

* Undefined values return `undef`
* Objects that are arrays return `array` (saves trip through `Array.isArray`)
* Numbers that have no fractional part return `int`
* All other numbers return `float`
* Functions return `func`
* Otherwise, `typeof(value)` is returned.

### tarray(value)

Shortcut for Array.isArray

### tbox(value)

Returns true if `value` is a collection type (object or array)

### tdict(value)

Return true if `value` is an object, but not an array. Eventually this should
also try to ensure this is a "flat" object with no functions as members, etc.

### tfunc(value)

Returns true if `value` is a function

### upd(collection, key, value)

Updates `key` in `collection` with value. Works with tables, arrays, and objects.

For objects, key should be an array of strings.

`key` can be an array of indices. `value` should be an array of the same size.

### where(collection, predicate)

Returns keys of `collection` that match `predicate`. 

If `collection` is something like an array and `predicate` is a function, `where` returns the indices where the function returns
true:

```
> X.where([1, 2, 3, 4, 5],function(x){return x%2==0})
[1,3]
```

If `predicate` is omitted, an array of all of the elements indices is returned.

For usage with tables, see "Where" below.

### X.U

Shortcut for undefined. I hate typing.

## File handling

Xacto' file handling features come in the form of two functions: `load` and `save`.

```
> X.save("./test.json",myData)
> myData2=X.load("./test.json")
> X.assert(X.equal(myData,myData2),"ugh")
```

See `lib/filehandlers.js` for a sense of how these are constructed while
these negligent docs remain unfinished.

## In-memory databases

### Create and open a database - X.table(name?, schema, backends?, options?)

Xacto databases live in their own folder which is specified when the Xacto instance
is created.

```
> var X=require('exacto');
> // open database folder. existing database and logs will be automatically loaded.
> X=X('./testdb/')
```
The first time you reference a table, you have to define its schema. You can also give
it a name.

```
> students=X.table('students',{name:'string',age:'int',species:'string'})
```

If you don't give the table a name, you won't be able to refer to it by its string name
elsewhere in your application. Using a string to refer to a table is useful because you
don't have to pass it around to all of your code that may need to do data manipulation.

### Insert - ins(collection, item)

You can reference the table by a string of its name using `X.ins` (surprisingly
handy in some situations) or via a table reference.

```
> X.ins('students', {name:'Tom',age:38,species:"Programmer"})
> // alternative forms:
> X.tbl.students.ins({name,'Arca',age:4,species:"Elegant Pomeranian"})
> students.ins({name:'Tyler',age:4,species:"Lil Bebe"})
```

See also the full explanation of `ins()` above.

### Select rows - sel(collection, predicate?)

Search for values matching `predicate` or find rows where `predicate(row)` returns true.

If you omit the predicate, will return all values.

Always returns an array of records. The array is empty if no match is found.

```
> // generate 1000 numbers from 0..100 and find those that are 42
> X.sel([X.randN(100, 1000)], 42) 
> X.sel('students', {name:'Tom'})
[{name:"Tom",age:38,species:"Programmer"}]
> students.sel({age:function(a){return a < 10;})
[{name:"Arca",age:4,species:"Elegant Pomeranian"},
 {name:"Tyler",age:4,species:"Lil Bebe"}]
```
TODO query capabilities in detail

### Query for matches - where(collection, predicate?)

`where` is used to search for values much like `sel`. `where` returns the indices that match the predicate
instead of the rows or matching values themselves. In other words, `where` returns an array of integers, but
`sel` returns an array of records/objects.

```
> X.where('students', {name:'Tom'})
[0]
> students.where({age:function(a){return a < 10;})
[1,2]
```

`where` always returns an array. It will be empty if no matches are found. You can use `X.len()` to check any
type of value's length.

Internally, `sel` often uses `where` to perform its searches.

### Update - upd(collection, predicate, value)

Update items in `collection` matching `predicate`.

`predicate` may be a function or in the case of a table a record/object.

```
> X.upd('students', {name:'Tom'}, {age:0}); // to be young again
```

`upd()` can also be used for non-table types. See the `upd` section above for more.

### Update log

When you create a table, you can supply a list of "backends" that are attached to it. These are like plugins or storage engines. 

One of them is the logger. This will record all `ins` and `upd` operations performed against the table since the time it was created.

If you don't want to maintain an update log, you can save your table whenever you want with `table.save('whatever.json')`.

The logger has a variety of options. To start, an example, with all options specified:

```
> let logopts={
 replay:true,
 flush:{
   time:60 * 1000,
   rows:100
 },
 rotate:1,
 interval:2 * 1000,
 unlink:false,
 verbose:true
};
> X.table('recipes',{id:'int',title:'string',ingredients:'any'},[X.mem, X.logger(logopts)])
```

Use `verbose:true` to see debugging information about the logger's behavior.
This is recommended when in development. You don't want to have any blank areas
in your understanding of your database's on-disk state.

When you first initialize the table and its associated logger, `replay:true` will
request it replays existing logs. If you'd like to do this on your own, you can use
`X.logger.replay()`.

To replay it will scan `XHOME/*.log.json` for log files. If it finds one, it
will apply its contents to the table. These are done as synchronous operations
and may slow the start of your app if the logs are numerous. You can set
`unlink:true` to remove each log file as its consumed, but you'll need to
save/reload your initial table state some other way if you want to persist data
across many executions of your program.

Information about what logs were loaded with `replay` can be accessed via the
array `X.logger.logStats`. 

After starting, the logger runs every `interval` seconds (2 seconds by
default). If you set `interval` to 0, it won't run, but you can run it manually
with `X.logger.check()`. 

Each time it runs, it examines the amount of items in its update log, and when
it last saved its state to disk. If it's more than `flush.rows` OR if it's been
longer than `flush.time` since the log was written to disk, it will save the
log as `XHOME/$TIME.log.json`.

The time values used here (including in the log file name) have a millisecond
resolution as per JavaScript conventions.

If you want to log everything and never risk losing an update, set `flush.rows`
to 1. 

Please note that once the logger is operational your script will have pending
timeouts and thus will not exit after finishing execution. 

If you don't want the logger to run on its own, you can set `interval` to 0,
and then use `X.logger.flush()` to save state on your own schedule. Then your
script will exit on its own correctly too.

## Bugs

Major bugs:

~~- currently pollutes globals. trying to find a better structure~~
- enumerations (columns grouped by unique values) do not currently work.
- logger needs a way to remove logs and take snapshots or some combination
	thereof. logger should be some kind of quasi-global behavior, rather than
	table specific. 
- there's something odd about converting some TypedArrays to buffers for
	loading/storing. In particular, floats seem to be saved as ints. I'm still
	looking into this.
- deep() bombs on some trees (nested arrays). Fix imminent.
- impending inevitable showdown with Promises. Thinking caps required.

See also the TODO list on top of `lib/xacto.js`

### Misc notes

Dumb for loop speed: https://jsperf.com/for-vs-foreach/37

`fileHandlers={'.json':{load(f):{..},save(f,x):{..},import,export()},'.txt':{..},'.csv':{..}`



