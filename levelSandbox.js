/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

var level   = require('level');
var sub     = require('level-sublevel');
var search    = require('level-search');
var chainDB = './chaindata';
var db      = sub(level(chainDB, {valueEncoding: 'json'}));
var index   = search(db, 'search');

// Add data to levelDB with key/value pair
exports.add = function (key, value) {
  return new Promise(function(resolve, reject) {
    db.put(key, value, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(exports.get(key));
      }
    });
  });
}

// Get data from levelDB with key
exports.get = function (key){
  return new Promise(function(resolve, reject) {
    db.get(key, function (err, value) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}

exports.getLastKey = function () {
  return new Promise(function(resolve, reject){
    db.createKeyStream({reverse : true, limit : 1}).on('data', function(data){
      resolve(Number(data));
    }).on('error', function(err){
      reject(err);
    }).on('close', function(){
      resolve(0);
    });
  });
}

exports.find = function (keys) {
  return new Promise(function(resolve, reject) {
    // ['hash', hash]
    // ['body', 'address', '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ']
    const result = [];
    try {
      index.createSearchStream(keys).on('data', function(data) {
        result.push(data.value);
      }).on('error', function(err){
        console.log(err);
        reject(err);
      }).on('close', function(){
        resolve(result);
      }).on('end', function(){
        resolve(result);
      });
    } catch(er) {
      console.log(er);
      reject(er);
    }
  });
}

exports.printAll = function () {
  console.log('<--DB Print Start---');
  db.createValueStream().on('data', function(data){
    console.log(data);
  }).on('error', function(err){
    console.log(err);
  }).on('close', function(){
    console.log('---DB Print End-->');
  });
}


/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

/*
(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
*/