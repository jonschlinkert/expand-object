/*!
 * expand-object <https://github.com/jonschlinkert/expand-object>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var set = require('set-value');

module.exports = function expand(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expand-object expects a string.');
  }

  if (!/[.|]/.test(str) && /,/.test(str)) {
    return expandArr(str);
  }

  var segs = str.split('|');
  var len = segs.length, i = 0;
  var o = {};

  while (len--) {
    var key = segs[i++];
    var val = '';
    var tmp = key.split(':');
    if (tmp.length > 1) {
      key = tmp[0];
      val = tmp[1];
      val = expandArr(val);
    }
    set(o, key, val);
  }
  return o;
};

function expandArr(val) {
  var arr = val.split(',');
  if (arr.length > 1) {
    val = arr;
  }
  return val;
}
