# xacto

Xacto is a tool for manipulating data with Javascript which is heavily inspired
by the amazing [Q/Kdb](http://kx.com) and Mathematica. It includes a general
utility API and an in-memory database implementation.

Work with your data at a high level, using a uniform set of functions that work
the same way against different types of in-memory values, files, remote
resources (not yet implemented), etc.

## Status

Pretty new. Some glaring omissions. Don't trust with your important data just yet. See "Bugs" below.

## Motivations

- JavaScript really sucks but we're stuck with it. I want to write JS that's as concise and meaningful as [Q by Kx](http://kx.com). 

- One size does not fit all. I want to be able to make websites that have app-tuned customizable data stores. 

- Every external dependency is a risk factor. Remove as many as possible. I want to work without MySQL or Redis or anything but Node itself.

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
- Zero dependencies (at least for now).

### Speed and brutality

For my own purposes I need this to be pretty fast so that was a primary concern
when designing the system.

- many functions use plain ole for(;;;) - still faster than all those lovely
	callbacks, but makes the code less terse than I'd like
- uses typed arrays to store integer values (and hopefully floats and other
	types soon; see below)
- uses Map instead of objects for table column handling - this should allow for
	tables with almsot any number of columns
- uses Set for internal row lists

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
> let z1=X.deep(z,function(s){return s.toUpperCase()},{type:'string'});
> z1
[ 'TOM', 23, 'BOB', [Function] ]
```

This is useful for recursing deep into objects to find or manipulate specific
values.

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

Returns an array of `f(x[i], i, opts)` for each item in x.

Works with arrays, objects, tables, and Maps.

### equal(x, y)

Performs a deep equality test between x and y.

### first(value) 

Synonym for head

### flip(value)

Transform dictionaries with lists of values into flattened dictionaries.

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

### head(value)

Returns the first item in value

### ins(collection, value)

Appends `value` to `collection`

This works for tables, arrays, etc.

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

Similar to currying. Returns a version of `func` with arguments already applied. Use
undefined to indicate an empty value that must be applied when calling the resulting
function.

```
> const X=require('./xacto')();
> const f=X.proj(function(a, b, c){ return 'Hello '+a+', '+b+', '+c }, 'Tom', undefined, 'Tyler')
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
See querying docs below.

### take(value, n)

Return the first `n` items in `value`.

Negative `n` will return items from the end of `value`.

```
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

Updates `key` in `collection` with value.

`key` can be an array of indices. Each will get `value`.

## File and Database API

### File handling

Xacto' file handling features come in the form of two functions: `load` and `save`.

```
> X.save("./test.json",myData)
> myData2=X.load("./test.json")
> X.assert(X.equal(myData,myData2),"ugh")
```

### Open the database

Xacto databases live in their own folder.

```
	var X=require('exacto');
	// open database folder. existing database and logs will be automatically loaded.
	X=X('./testdb/')
```
The first time you reference a table, you have to define its schema:

```
	students=X.table('students',{id:'int',name:'string',age:'int'})
```
	
### Insert (ins)

You can reference the table by a string of its name using `X.ins` (surprisingly
handy in some situations) or via a table reference.

```
	X.ins('students', {name:'Tom',age:38})
	// alternative forms:
	X.students.ins({name,'Arca',age:4*7})
	students.ins({name:'Cricket',age:4})
```

### Query (sel)

```
	X.sel('students', {name:'Tom'})
	students.sel({age:function(a){return a < 10;})
```

### Update log

```
> X.table('recipes',{id:'int',title:'string',ingredients:'any'},[X.mem, X.logger])
```

## Bugs

Major bugs:

- currently pollutes globals. trying to find a better structure
- enumerations (columns grouped by unique values) do not currently work.
- logger needs more testing and a freshening up

### Misc notes

Dumb for loop speed: https://jsperf.com/for-vs-foreach/37

`fileHandlers={'.json':{load(f):{..},save(f,x):{..},import,export()},'.txt':{..},'.csv':{..}`



