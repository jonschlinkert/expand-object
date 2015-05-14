/*!
 * expand-object <https://github.com/jonschlinkert/expand-object>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var expand = require('./');

describe('expand', function () {
  it('should expand dots into child objects:', function () {
    expand('a').should.eql({a: ''});
    expand('a.b').should.eql({a: {b: ''}});
    expand('a.b.c').should.eql({a: {b: {c: ''}}});
    expand('a.b.c.d').should.eql({a: {b: {c: {d: ''}}}});
  });

  it('should expand pipes into sibling objects:', function () {
    expand('a|b').should.eql({a: '', b: ''});
    expand('a|b|c').should.eql({a: '', b: '', c: ''});
    expand('a|b|c|d').should.eql({a: '', b: '', c: '', d: ''});
  });

  it('should expand colons into key-value pairs:', function () {
    expand('a:b').should.eql({a: 'b'});
    expand('a.b:c').should.eql({a: {b: 'c'}});
    expand('a.b.c:d').should.eql({a: {b: {c: 'd'}}});
  });

  it('should expand sibling objects into key-value pairs:', function () {
    expand('a:b|c:d').should.eql({a: 'b', c: 'd'});
    expand('a:b|c:d|e:f').should.eql({a: 'b', c: 'd', e: 'f'});
    expand('a:b|c:d|e:f|g:h').should.eql({a: 'b', c: 'd', e: 'f', g: 'h'});
  });

  it('should expand child objects into key-value pairs:', function () {
    expand('a.b:c').should.eql({a: {b: 'c'}});
    expand('a.b.c:d').should.eql({a: {b: {c: 'd'}}});
    expand('a.b.c.d:e').should.eql({a: {b: {c: {d: 'e'}}}});
  });

  it('should expand sibling and child objects into key-value pairs:', function () {
    expand('a:b|c:d').should.eql({a: 'b', c: 'd'});
    expand('a.b.c|d.e:f').should.eql({a: {b: {c: ''}}, d: {e: 'f'}});
    expand('a.b:c|d.e:f').should.eql({a: {b: 'c'}, d: {e: 'f'}});
    expand('a.b.c:d|e.f.g:h').should.eql({a: {b: {c: 'd'}}, e: {f: {g: 'h'}}});
  });

  it('should expand comma separated values into arrays:', function () {
    expand('a,b').should.eql(['a', 'b']);
    expand('a,b,c').should.eql(['a', 'b', 'c']);
  });

  it('should expand siblings with comma separated values into arrays:', function () {
    expand('a:b,c,d|e:f,g,h').should.eql({a: ['b', 'c', 'd'], e: ['f', 'g', 'h']});
  });

  it('should expand children with comma separated values into arrays:', function () {
    expand('a.b.c:d,e,f|g.h:i,j,k').should.eql({ a: {  b: { c: [ 'd', 'e', 'f' ] } }, g: { h: [ 'i', 'j', 'k' ] } });
  });

  it('should throw an error:', function () {
    (function () {
      expand();
    }).should.throw('expand-object expects a string.');
  });
});

describe('escaping', function () {
  it('should escape dots preceded by slashes:', function () {
    expand('a\\.b').should.eql({'a.b': ''});
    expand('a\\.b\\.c').should.eql({'a.b.c': ''});
    expand('a\\.b\\.c\\.d').should.eql({'a.b.c.d': ''});

    expand('a\\.b.c').should.eql({'a.b': {c: ''}});
    expand('a\\.b.c.d').should.eql({'a.b': {c: {d: ''}}});
    expand('a\\.b.c.d\\.e').should.eql({'a.b': {c: {'d.e': ''}}});
    expand('a\\.b.c\\.d').should.eql({'a.b': {'c.d': ''}});
  });
});
