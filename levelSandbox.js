/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
exports.add = function (key, value){
  return db.put(key, JSON.stringify(value)).then(() => {
    return exports.get(key);
  });
}

// Get data from levelDB with key
exports.get = function (key){
  return db.get(key).then(JSON.parse);
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