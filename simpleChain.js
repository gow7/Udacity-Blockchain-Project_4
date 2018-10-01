/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const DB = require('./levelSandbox.js');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.getBlockHeight().then((data)=>{
      if (data == 0) {
        console.log('Adding Genesis Block');
        this.addGenesisBlock(new Block("First block in the chain - Genesis block"));
      }
    }).catch(function(err){
      console.log('Error construction Blockchain :' + err);
      process.exit(1);
    });
  }

  addGenesisBlock(newBlock) {
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    DB.add(newBlock.height, newBlock).then(function(data){
      console.log(newBlock);
      console.log('Added Genesis Block');
    }).catch(function(err){
      console.log('Error Adding Genesis Block :' + err);
      process.exit(1);
    });
  }

  addBlock(newBlock){
    return this.getBlockHeight().then((data)=>{
      newBlock.height = data + 1;
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      return this.getBlock(data).then(block => {
        newBlock.previousBlockHash = block.hash;
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        return DB.add(newBlock.height, newBlock).then(function(){
          console.log(newBlock);
          console.log('Added Block : ' + newBlock.height);
          return newBlock;
        }).catch(function(err){
          console.log('Error Adding Block :' + newBlock.height + " Error :" + err);
          throw err;
        });
      });
    });
  }

  // Get block height
  getBlockHeight(){
    return DB.getLastKey();
  }

  getBlock(height) {
    return DB.get(height);
  }

  // validate block
  validateBlock(blockHeight){
    return this.getBlock(blockHeight).then(block => {
      let blockHash = block.hash;
      block.hash = '';
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      if (blockHash===validBlockHash) {
        console.log('Block valid for height :' + blockHeight);
        return true;
      } else {
        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        return false;
      }
    });
  }
  
  validateChain(){
    let errorLog = [];
    this.getBlockHeight().then(height => {
      let blockComplete = false;
      let chainComplete = false;
      return new Promise((resolve, reject) => {
        for (let index = 0; index < height + 1; index++) {
          this.validateBlock(index).then(isValid => {
            if (isValid === false) {
              errorLog.push(index);
            }
            if (index === height) {
              blockComplete = true;
              if (blockComplete === chainComplete) {
                resolve(true);
              }
            }
          });
          if (index < height) {
            let currentBlock = this.getBlock(index);
            let nextBlock = this.getBlock(index + 1);
            Promise.all([currentBlock, nextBlock]).then(ready => {
              if (ready[0].hash !== ready[1].previousBlockHash) {
                errorLog.push(index + 1);
              } else {
                console.log('Chain valid for height :' + index);
              }
              if (index === height -1) {
                chainComplete = true;
                if (blockComplete === chainComplete) {
                  resolve(true);
                }
              }
            });
          }
        }
      });
    }).then(function(){
      if (errorLog.length>0) {
        errorLog =  Array.from(new Set(errorLog));
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
      } else {
        console.log('No errors detected');
      }
    });
  }
}

const myBlockChain = new Blockchain();
exports.addBlock = (body) => {
  return myBlockChain.addBlock(new Block(body));
};

exports.getBlock = myBlockChain.getBlock;
/*myBlockChain.addBlock(new Block('testing...'));
myBlockChain.validateChain();*/