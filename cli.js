#!/usr/bin/env node

'use strict';

process.title = 'expand-object';

var argv = require('minimist')(process.argv.slice(2));
var stdin = require('get-stdin');
var Store = require('data-store');
var store = new Store('expand-object');

var expand = require('./index');
var pkg = require('./package.json');

function help() {
  console.log();
  console.log('  ' + pkg.description);
  console.log();
  console.log('  Usage: cli [options] <string>');
  console.log();
  console.log('    -h, --help     output usage information');
  console.log('    -V, --version  output the version number');
  console.log('    -r, --raw      output as raw javascript object - don\'t stringify');
  console.log();
  console.log('  Examples:');
  console.log('');
  console.log('    $ expand-object "a:b"');
  console.log('    $ expand-object --raw "a:b"');
  console.log('    $ echo "a:b" | expand-object');
  console.log('');
}

if (argv._.length === 0 && Object.keys(argv).length === 1 || argv.help) {
  help();
}

function run(contents) {
  if (argv.get) {
    output = store.get(argv.get);
    console.log(output);
    return;
  }

  var output = contents;
  if (argv.set) {
    output = expand(argv.set);
    store.set(output);
  } else {
    output = expand(contents);
    if (!argv.raw) {
      output = JSON.stringify(output);
    }
  }

  console.log(output);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  return stdin(function(contents) {
    run(contents);
  });
}

run(argv._[0] || '');
