'use strict';

var isNumber = require('is-number');
var set = require('set-value');

/**
 * Expand the given string into an object.
 *
 * @param  {String} `str`
 * @return {Object}
 */

function expand(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expand-object expects a string.');
  }

  if (!/[.|:]/.test(str) && /,/.test(str)) {
    return toArray(str);
  }

  var arr = str.split('|');
  var len = arr.length, i = -1;
  var res = {};

  if (isArrayLike(str) && arr.length === 1) {
    return expandArrayObj(str);
  }

  while (++i < len) {
    var val = arr[i];
    if (!/[.,\|:]/.test(val)) {
      res[val] = '';
    } else {
      res = expandObject(res, val);
    }
  }
  return res;
}

function setValue(obj, a, b) {
  var val = resolveValue(b || '');
  if (~a.indexOf('.')) {
    return set(obj, a, val);
  } else {
    obj[a] = val;
  }
  return obj;
}

function resolveValue(val) {
  if (typeof val === 'string' && ~val.indexOf(',')) {
    val = toArray(val);
  }
  if (Array.isArray(val)) {
    return val.map(function (ele) {
      if (~ele.indexOf('.')) {
        return setValue({}, ele, '');
      }
      return ele;
    });
  }
  return val;
}

function expandArray(str) {
  var segs = str.split(':');
  var key = segs.shift();
  var res = {}, val = [];

  segs.forEach(function (seg) {
    val = val.concat(resolveValue(toArray(seg)));
  });

  res[key] = val;
  return res;
}

function toArray(str) {
  return (str || '').split(',')
    .filter(Boolean)
    .map(typeCast);
}

function expandSiblings(segs) {
  var first = segs.shift();
  var parts = first.split('.');
  var arr = [parts.pop()].concat(segs);
  var key = parts.join('.');
  var siblings = {};

  var val = arr.reduce(function (acc, val) {
    expandObject(acc, val);
    return acc;
  }, {});

  if (!key) return val;
  set(siblings, key, val);
  return siblings;
}

function expandObject(res, str) {
  var segs = str.split('+');
  if (segs.length > 1) {
    return expandSiblings(segs);
  }
  segs = str.split(':');
  var parts = toArray(segs[1]);
  if (parts.length > 1) {
    setValue(res, segs[0], parts);
  } else {
    setValue(res, segs[0], typeCast(segs[1]));
  }
  return res;
}

function expandArrayObj(str) {
  var m = /\w+:.*:/.exec(str);
  if (!m) return expandArray(str);

  var i = str.indexOf(':');
  var key = str.slice(0, i);
  var val = str.slice(i + 1);

  if (/\w+,\w+,/.test(val)) {
    var obj = {};
    obj[key] = toArray(val).map(function (ele) {
      return ~ele.indexOf(':')
        ? expandObject({}, ele)
        : ele;
    });
    return obj;
  }

  return toArray(str).map(function (ele) {
    return expandObject({}, ele);
  });
}

function typeCast(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (isNumber(val)) {
    return +val;
  }
  if (val && val.length >= 3 && isRegexString(val)) {
    var m = /([gmi]+)$/.exec(val);
    var flags = '';
    if (m) {
      flags = m[1];
      val = val.slice(0, val.length - flags.length);
    }
    val = val.slice(1, val.length - 1);
    return new RegExp(val, flags);
  }
  return val;
}

function isRegexString(str) {
  return str.charAt(0) === '/' && /\/([gmi]+)?$/.test(str);
}

function isArrayLike(str) {
  return /^(?:(\w+:\w+[,:])+)+/.exec(str);
}

/**
 * Expose `expand`
 */

module.exports = expand;
