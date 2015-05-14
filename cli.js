#!/usr/bin/env node

'use strict';
var program = require('commander');
var stdin = require('get-stdin');
var expand = require('./index');

process.title = 'expand-object';

var pkg = require('./package.json');

program
  .description(pkg.description)
  .version(pkg.version)
  .usage('[options] <string>')
  .option('-r, --raw', "Output as raw javascript object - don't stringify")
  .on('--help', function() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ expand-object "a:b"');
    console.log('    $ expand-object --raw "a:b"');
    console.log('    $ echo "a:b" | expand-object');
    console.log('');
  })
  .parse(process.argv);

function run(contents) {
  var output = expand(contents);
  if (!program.raw) {
    output = JSON.stringify(output);
  }
  console.log(output);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  return stdin(function(contents) {
    run(contents);
  });
}

if (!program.args.length) {
  program.help();
  return;
}

run(program.args[0]);
