'use strict';
var test = require('tape');
var Random = require('./random');

test('called correct number of times', function (t) {
  var random = new Random(13);
  t.plan(26);
  random.on('data', function (d) {
    t.ok('_id' in d, 'has _id');
    t.equals(Object.keys(d).length, 4, 'correct number of keys');
  });
});