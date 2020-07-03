var Web3 = require("./web3.js");
var web3 = new Web3();
var BigNumber = require('./bignumber');

/**
 * SolidityTypeInt is a prootype that represents int type
 * It matches:
 * int
 * int[]
 * int[4]
 * int[][]
 * int[3][]
 * int[][6][], ...
 * int32
 * int64[]
 * int8[4]
 * int256[][]
 * int[3][]
 * int64[][6][], ...
 */
// var SolidityTypeInt = function () {
//   this._inputFormatter = f.formatInputInt;
//   this._outputFormatter = f.formatOutputInt;
// };

var padRight = function (string, chars, sign) {
  return string + (new Array(chars - string.length + 1).join(sign ? sign : "0"));
};

var padLeft = function (string, chars, sign) {
  return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
};
var toTwosComplement = function (number) {
  var bigNumber = toBigNumber(number).round();
  if (bigNumber.lessThan(0)) {
      return new BigNumber("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 16).plus(bigNumber).plus(1);
  }
  return bigNumber;
};

var SolidityParam = function (value, offset) {
  this.value = value || '';
  this.offset = offset; // offset in bytes
};

SolidityParam.prototype.dynamicPartLength = function () {
  return this.dynamicPart().length / 2;
};

SolidityParam.prototype.withOffset = function (offset) {
  return new SolidityParam(this.value, offset);
};

SolidityParam.prototype.combine = function (param) {
  return new SolidityParam(this.value + param.value); 
};

SolidityParam.prototype.isDynamic = function () {
  return this.offset !== undefined;
};

SolidityParam.prototype.offsetAsBytes = function () {
  return !this.isDynamic() ? '' : padLeft(toTwosComplement(this.offset).toString(16), 64);
};

SolidityParam.prototype.staticPart = function () {
  if (!this.isDynamic()) {
      return this.value; 
  } 
  return this.offsetAsBytes();
};

SolidityParam.prototype.dynamicPart = function () {
  return this.isDynamic() ? this.value : '';
};

SolidityParam.prototype.encode = function () {
  return this.staticPart() + this.dynamicPart();
};

SolidityParam.encodeList = function (params) {
  
  // updating offsets
  var totalOffset = params.length * 32;
  var offsetParams = params.map(function (param) {
      if (!param.isDynamic()) {
          return param;
      }
      var offset = totalOffset;
      totalOffset += param.dynamicPartLength();
      return param.withOffset(offset);
  });

  // encode everything!
  return offsetParams.reduce(function (result, param) {
      return result + param.dynamicPart();
  }, offsetParams.reduce(function (result, param) {
      return result + param.staticPart();
  }, ''));
};

var fromAscii = function(str) {
  var hex = "";
  for(var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      var n = code.toString(16);
      hex += n.length < 2 ? '0' + n : n;
  }

  return "0x" + hex;
};

/**
 * Returns true if object is string, otherwise false
 *
 * @method isString
 * @param {Object}
 * @return {Boolean}
 */
var isString = function (object) {
  return typeof object === 'string' ||
      (object && object.constructor && object.constructor.name === 'String');
};

/**
* Returns true if object is BigNumber, otherwise false
*
* @method isBigNumber
* @param {Object}
* @return {Boolean}
*/
var isBigNumber = function (object) {
  return object instanceof BigNumber ||
      (object && object.constructor && object.constructor.name === 'BigNumber');
};

/**
* Takes an input and transforms it into an bignumber
*
* @method toBigNumber
* @param {Number|String|BigNumber} a number, string, HEX string or BigNumber
* @return {BigNumber} BigNumber
*/
var toBigNumber = function(number) {
  /*jshint maxcomplexity:5 */
  number = number || 0;
  if (isBigNumber(number))
      return number;

  if (isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
      return new BigNumber(number.replace('0x',''), 16);
  }

  return new BigNumber(number.toString(10), 10);
};

/**
* Converts value to it's hex representation
*
* @method fromDecimal
* @param {String|Number|BigNumber}
* @return {String}
*/
var fromDecimal = function (value) {
  var number = toBigNumber(value);
  var result = number.toString(16);

  return number.lessThan(0) ? '-0x' + result.substr(1) : '0x' + result;
};

/**
* Auto converts any given value into it's hex representation.
*
* And even stringifys objects before.
*
* @method toHex
* @param {String|Number|BigNumber|Object}
* @return {String}
*/
var isBoolean = function (object) {
  return typeof object === 'boolean';
};	
function ucs2decode(string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  var value;
  var extra;
  while (counter < length) {
    value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // high surrogate, and there is a next character
      extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}
var stringFromCharCode = String.fromCharCode;
function checkScalarValue(codePoint) {
  if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    throw Error(
      'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
      ' is not a scalar value'
    );
  }
}
function createByte(codePoint, shift) {
  return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
}
function encodeCodePoint(codePoint) {
  if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
    return stringFromCharCode(codePoint);
  }
  var symbol = '';
  if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
    symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
  }
  else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
    checkScalarValue(codePoint);
    symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
    symbol += createByte(codePoint, 6);
  }
  else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
    symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
    symbol += createByte(codePoint, 12);
    symbol += createByte(codePoint, 6);
  }
  symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
  return symbol;
}

function utf8encode(string) {
  var codePoints = ucs2decode(string);
  var length = codePoints.length;
  var index = -1;
  var codePoint;
  var byteString = '';
  while (++index < length) {
    codePoint = codePoints[index];
    byteString += encodeCodePoint(codePoint);
  }
  return byteString;
}
var fromUtf8 = function(str) {
  str = utf8encode(str);
  var hex = "";
  for(var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code === 0)
          break;
      var n = code.toString(16);
      hex += n.length < 2 ? '0' + n : n;
  }

  return "0x" + hex;
};

var toHex = function (val) {
  if (isBoolean(val))
      return fromDecimal(+val);

  if (isBigNumber(val))
      return fromDecimal(val);

  if (typeof val === 'object')
      return fromUtf8(JSON.stringify(val));

  if (isString(val)) {
      if (val.indexOf('-0x') === 0)
          return fromDecimal(val);
      else if(val.indexOf('0x') === 0)
          return val;
      else if (!isFinite(val))
          return fromAscii(val);
  }

  return fromDecimal(val);
};

var formatInputBytes = function (value) {
  var result = toHex(value).substr(2);
  var l = Math.floor((result.length + 63) / 64);
  result = padRight(result, l * 64);
  return new SolidityParam(result);
};

var formatInputInt = function (value) {
  BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
  var result = padLeft(toTwosComplement(value).toString(16), 64);
  return new SolidityParam(result);
};

var formatInputDynamicBytes = function (value) {
  var result = toHex(value).substr(2);
  var length = result.length / 2;
  var l = Math.floor((result.length + 63) / 64);
  result = padRight(result, l * 64);
  var tt = new SolidityParam(formatInputInt(length).value + result);
  console.log(JSON.stringify(tt));
};

const btcSymbol = hexToBytes(toHex("BTC"))
formatInputDynamicBytes(btcSymbol);
formatInputDynamicBytes('BTC');