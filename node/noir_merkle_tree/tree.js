const { sha256 } = require('js-sha256');

let commitment_0 = sha256.update(new Uint8Array([1, 10, 10]));
let commitment_1 = sha256.update(new Uint8Array([2, 20, 30]));
var commitment_2 = sha256.update('0x2c027c86fd5f26783f3bb1b1743515d9ff2d64433c3d627f9dffdef06e30cbc5');
commitment_2.update(sha256.update(numToUint8Array(30)).digest());
commitment_2.update(sha256.update(numToUint8Array(60)).digest());

let lvl1 = sha256.update(commitment_0.hex());
let lvl2 = sha256.update(commitment_1.hex());
lvl2 = lvl2.update(lvl1.hex());
let root = sha256.update(commitment_2.array())
root = root.update(lvl2.array());

function numToUint8Array(num) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}

console.log(root.digest());
console.log(lvl2.array())