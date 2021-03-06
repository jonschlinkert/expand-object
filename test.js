/*!
 * expand-object <https://github.com/jonschlinkert/expand-object>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var expand = require('./');

function eql(a, b) {
  return assert.deepEqual(a, b);
}

describe('expand', function() {
  it('should expand dots into child objects:', function() {
    eql(expand('a'), {a: ''});
    eql(expand('a.b'), {a: {b: ''}});
    eql(expand('a.b.c'), {a: {b: {c: ''}}});
    eql(expand('a.b.c.d'), {a: {b: {c: {d: ''}}}});
  });

  it('should expand pipes into sibling objects:', function() {
    eql(expand('a|b'), {a: '', b: ''});
    eql(expand('a|b|c'), {a: '', b: '', c: ''});
    eql(expand('a|b|c|d'), {a: '', b: '', c: '', d: ''});
  });

  it('should set undefined values as `true` when `toBoolean` is defined:', function() {
    eql(expand('a|b', {toBoolean: true}), {a: true, b: true});
    eql(expand('a|b|c', {toBoolean: true}), {a: true, b: true, c: true});
    eql(expand('a|b|c|d', {toBoolean: true}), {a: true, b: true, c: true, d: true});
  });

  it('should expand colons into key-value pairs:', function() {
    eql(expand('a:b'), {a: 'b'});
    eql(expand('a.b:c'), {a: {b: 'c'}});
    eql(expand('a.b.c:d'), {a: {b: {c: 'd'}}});
  });

  it('should expand sibling objects into key-value pairs:', function() {
    eql(expand('a:b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a:b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a:b|c:d|e:f'), {a: 'b', c: 'd', e: 'f'});
    eql(expand('a:b|c:d|e:f|g:h'), {a: 'b', c: 'd', e: 'f', g: 'h'});
  });

  it('should expand child objects into key-value pairs:', function() {
    eql(expand('a.b:c'), {a: {b: 'c'}});
    eql(expand('a.b.c:d'), {a: {b: {c: 'd'}}});
    eql(expand('a.b.c.d:e'), {a: {b: {c: {d: 'e'}}}});
    eql(expand('a:b.c.d:e'), {a: {b: {c: {d: 'e'}}}});
    eql(expand('a:b.c.d.e.f:g'), {a: {b: {c: {d: {e: {f: 'g'}}}}}});
  });

  it('should expand sibling and child objects into key-value pairs:', function() {
    eql(expand('a:b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a.b.c|d.e:f'), {a: {b: {c: ''}}, d: {e: 'f'}});
    eql(expand('a.b:c|d.e:f'), {a: {b: 'c'}, d: {e: 'f'}});
    eql(expand('a.b.c:d|e.f.g:h'), {a: {b: {c: 'd'}}, e: {f: {g: 'h'}}});
  });

  it('should expand flags:', function() {
    eql(expand('a=b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a.b.c=d'), {a: {b: {c: 'd'}}});
  });

  it('should expand comma separated values into arrays:', function() {
    eql(expand('a,b'), ['a', 'b']);
    eql(expand('a,b,c'), ['a', 'b', 'c']);
    eql(expand('a,b,c,'), ['a', 'b', 'c']);
  });

  it('should expand siblings with comma separated values into arrays:', function() {
    eql(expand('a:b,c,d|e:f,g,h'), {a: ['b', 'c', 'd'], e: ['f', 'g', 'h']});
  });

  it('should expand children with comma separated values into arrays:', function() {
    eql(expand('a.b.c:d,e,f|g.h:i,j,k'), { a: {  b: { c: [ 'd', 'e', 'f' ] } }, g: { h: [ 'i', 'j', 'k' ] } });
  });

  it('should expand an array of objects:', function() {
    eql(expand('foo:bar,baz,a:b'), {foo: ['bar', 'baz', {a: 'b'}]});
    eql(expand('a:b,c:d,e:f'), [{a: 'b'}, {c: 'd'}, {e: 'f'}]);
    eql(expand('a.b:c.d,e.f:g,h:i'), {a: {b: [{c: {d: '' }}, {e: {f: '' } }] }});
    // maybe that last one should be more like this?:
    // eql(expand('a:c.d,e:f'), { a: {c: ['d', {e: 'f'}] }});
  });

  it('should expand objects with array values:', function() {
    eql(expand('a:b,'), {a: ['b']});
    eql(expand('a:b,c'), {a: ['b', 'c']});
    eql(expand('a:c.d,e'), { a: [ { c: { d: '' } }, 'e' ]});
    eql(expand('a:b,c,d'), {a: ['b', 'c', 'd']});
    eql(expand('a:b,c,d|e:f,g,i'), {a: ['b', 'c', 'd'], e: ['f', 'g', 'i']});
  });

  it('should expand objects with sibling:', function() {
    eql(expand('a:b+c:d'), {a: 'b', c: 'd'});
    eql(expand('a:b+c:d+e:f'), {a: 'b', c: 'd', e: 'f'});
    eql(expand('a.b:c+d:e+f:g'), {a: {b: 'c', d: 'e', f: 'g'}});
    eql(expand('a.b:c|d:e|f:g'), {a: {b: 'c'}, d: 'e', f: 'g'});
    eql(expand('a.b.c:d+e:f+g:h'), {a: {b: {c: 'd', e: 'f', g: 'h'}}});
  });

  it('should type-cast booleans:', function() {
    eql(expand('a:true'), {a: true});
    eql(expand('a.b:true'), {a: {b: true}});
    eql(expand('a.b:false'), {a: {b: false}});

    eql(expand('a,true'), ['a', true]);
    eql(expand('a,false'), ['a', false]);
  });

  it('should type-cast numbers:', function() {
    eql(expand('a:5'), {a: 5});
    eql(expand('a.b:5'), {a: {b: 5}});
    eql(expand('a.b:9'), {a: {b: 9}});

    eql(expand('a,5'), ['a', 5]);
    eql(expand('a,9'), ['a', 9]);
    eql(expand('1,2,3,4,5'), [1,2,3,4,5]);
  });

  it('misc:', function() {
    eql(expand('a.b.c.d:x,y'), {a: { b: {c: { d: [ 'x', 'y' ] } }}});
  });


  it('should throw an error:', function() {
    assert.throws(function() {
      expand();
    }, 'expand-object expects a string.');
  });
});

describe('urls:', function() {
  it('should not split on colon in urls:', function() {
    eql(expand('https://foo.com'), {'https://foo.com': ''});
  });
});

describe('escaping', function() {
  it('should support escaped pipes:', function() {
    eql(expand('a\\|b'), {'a|b': ''});
    eql(expand('a\\|b|c|d'), {'a|b': '', c: '', d: ''});
  });

  it('should not choke on file paths:', function() {
    eql(expand('/a/b/c'), {'/a/b/c': ''});
    eql(expand('/abc'), {'/abc': ''});
    eql(expand('/abc,'), ['/abc']);
  });

  it('should support escape dots:', function() {
    eql(expand('a\\.b'), {'a.b': ''});
    eql(expand('a\\.b\\.c'), {'a.b.c': ''});
    eql(expand('a\\.b\\.c\\.d'), {'a.b.c.d': ''});

    eql(expand('a\\.b.c'), {'a.b': {c: ''}});
    eql(expand('a\\.b.c.d'), {'a.b': {c: {d: ''}}});
    eql(expand('a\\.b.c.d\\.e'), {'a.b': {c: {'d.e': ''}}});
    eql(expand('a\\.b.c\\.d'), {'a.b': {'c.d': ''}});
  });
});
