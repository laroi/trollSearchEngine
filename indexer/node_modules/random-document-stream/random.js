'use strict';
var Readable = require('readable-stream').Readable;
var Chance = require('chance');
var inherits = require('inherits');

inherits(RandomStream, Readable);
module.exports = RandomStream;

function RandomStream(number) {
  if (!(this instanceof RandomStream)) {
    return new RandomStream(number);
  }
  Readable.call(this, {objectMode: true});
  this.chance = new Chance();
  this.number = number;
}

RandomStream.prototype.makeJunk = function () {
  return {
    name: this.chance.name({
      middle_initial: true,
      prefix: true
    }),
    description: this.chance.sentence(),
    address: this.chance.address(),
    _id: this.chance.guid()
  };
};

RandomStream.prototype._read = function () {
  if (this.number--) {
    while (this.push(this.makeJunk()) && this.number) {
      this.number--;
    }
  } else {
    this.push(null);
  }
};