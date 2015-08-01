/*!
 * expand-object <https://github.com/jonschlinkert/expand-object>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha */
var assert = require('assert');
var expand = require('./');

function eql(a, b) {
  return assert.deepEqual(a, b);
}

describe('expand', function () {
  it('should expand dots into child objects:', function () {
    eql(expand('a'), {a: ''});
    eql(expand('a.b'), {a: {b: ''}});
    eql(expand('a.b.c'), {a: {b: {c: ''}}});
    eql(expand('a.b.c.d'), {a: {b: {c: {d: ''}}}});
  });

  it('should expand pipes into sibling objects:', function () {
    eql(expand('a|b'), {a: '', b: ''});
    eql(expand('a|b|c'), {a: '', b: '', c: ''});
    eql(expand('a|b|c|d'), {a: '', b: '', c: '', d: ''});
  });

  it('should expand colons into key-value pairs:', function () {
    eql(expand('a:b'), {a: 'b'});
    eql(expand('a.b:c'), {a: {b: 'c'}});
    eql(expand('a.b.c:d'), {a: {b: {c: 'd'}}});
  });

  it('should expand sibling objects into key-value pairs:', function () {
    eql(expand('a:b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a:b|c:d|e:f'), {a: 'b', c: 'd', e: 'f'});
    eql(expand('a:b|c:d|e:f|g:h'), {a: 'b', c: 'd', e: 'f', g: 'h'});
  });

  it('should expand child objects into key-value pairs:', function () {
    eql(expand('a.b:c'), {a: {b: 'c'}});
    eql(expand('a.b.c:d'), {a: {b: {c: 'd'}}});
    eql(expand('a.b.c.d:e'), {a: {b: {c: {d: 'e'}}}});
  });

  it('should expand sibling and child objects into key-value pairs:', function () {
    eql(expand('a:b|c:d'), {a: 'b', c: 'd'});
    eql(expand('a.b.c|d.e:f'), {a: {b: {c: ''}}, d: {e: 'f'}});
    eql(expand('a.b:c|d.e:f'), {a: {b: 'c'}, d: {e: 'f'}});
    eql(expand('a.b.c:d|e.f.g:h'), {a: {b: {c: 'd'}}, e: {f: {g: 'h'}}});
  });

  it('should expand comma separated values into arrays:', function () {
    eql(expand('a,b'), ['a', 'b']);
    eql(expand('a,b,c'), ['a', 'b', 'c']);
    eql(expand('a,b,c,'), ['a', 'b', 'c']);
  });

  it('should expand siblings with comma separated values into arrays:', function () {
    eql(expand('a:b,c,d|e:f,g,h'), {a: ['b', 'c', 'd'], e: ['f', 'g', 'h']});
  });

  it('should expand children with comma separated values into arrays:', function () {
    eql(expand('a.b.c:d,e,f|g.h:i,j,k'), { a: {  b: { c: [ 'd', 'e', 'f' ] } }, g: { h: [ 'i', 'j', 'k' ] } });
  });

  it('should expand an array of objects:', function () {
    eql(expand('a:b,c:d,e:f'), [{a: 'b'}, {c: 'd'}, {e: 'f'}]);
    eql(expand('a.b:c.d,e.f:g,h:i'), {a: {b: [{c: {d: '' }}, {e: {f: '' } }] }});
    eql(expand('a:c.d,e'), { a: [ { c: { d: '' } }, 'e' ]});
    // eql(expand('a:c.d,e:f'), { a: [ { c: { d: '' } }, {e: 'f'} ]});
  });

  it('misc:', function () {
    eql(expand('a.b.c.d:x,y'), {a: { b: {c: { d: [ 'x', 'y' ] } }}});
  });

  it('should throw an error:', function () {
    assert.throws(function () {
      expand();
    }, 'expand-object expects a string.');
  });
});

describe('escaping', function () {
  it('should escape dots preceded by slashes:', function () {
    eql(expand('a\\.b'), {'a.b': ''});
    eql(expand('a\\.b\\.c'), {'a.b.c': ''});
    eql(expand('a\\.b\\.c\\.d'), {'a.b.c.d': ''});

    eql(expand('a\\.b.c'), {'a.b': {c: ''}});
    eql(expand('a\\.b.c.d'), {'a.b': {c: {d: ''}}});
    eql(expand('a\\.b.c.d\\.e'), {'a.b': {c: {'d.e': ''}}});
    eql(expand('a\\.b.c\\.d'), {'a.b': {'c.d': ''}});
  });
});
