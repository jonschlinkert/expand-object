'use strict';

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
    return expandArray(str);
  }

  while (++i < len) {
    var val = arr[i];
    if (!/[.,|:]/.test(val)) {
      res[val] = '';
    } else {
      expandObject(res, val);
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
  return toArray(str).map(function (ele) {
    return expandObject({}, ele);
  });
}

function toArray(str) {
  return (str || '').split(',').filter(Boolean);
}

function expandObject(res, str) {
  var segs = str.split(':');
  var parts = toArray(segs[1]);
  if (parts.length > 1) {
    setValue(res, segs[0], parts);
  } else {
    setValue(res, segs[0], segs[1]);
  }
  return res;
}

function isArrayLike(str) {
  return /^(?:\w+[,:]\w+[,:])+/.test(str);
}

/**
 * Expose `expand`
 */

module.exports = expand;
