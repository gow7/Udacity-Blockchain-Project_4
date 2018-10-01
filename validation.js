'use strict';

const bitcoinMessage = require('bitcoinjs-message');
const activeAddresses = {};

const currentTimeStamp = function() {
    return new Date().getTime().toString().slice(0, -3);
}

const requestTimeStamp = function(address) {
    const requestTime = activeAddresses[address];
    return requestTime === undefined ? "time-out" : requestTime;
}

const message = function(address) {
    return `${address}:${requestTimeStamp(address)}:starRegistry`;
}

const validationWindow = function(address) {
    let res = 300 - (currentTimeStamp() - activeAddresses[address]);
    return isNaN(res) ? 0 : res;
}

const response = function(address) {
    return {address: address,
        requestTimeStamp: requestTimeStamp(address),
        message: message(address),
        validationWindow: validationWindow(address)}
}

exports.newRequest = function (address) {
    activeAddresses[address] = currentTimeStamp();
    setTimeout(() => {delete activeAddresses[address]}, 300000);
    return response(address);
}

exports.sigValidate = function (address, signature) {
    const mess = message(address);
    const status = response(address);
    status.messageSignature = "not-valid";
    const res = {registerStar: false, status: status};
    try {
        if (bitcoinMessage.verify(mess, address, signature)) {
            res.registerStar = true;
            res.status.messageSignature = "valid";
        }
    } catch (error) {
        res.status.messageSignature = error.message;
    }
    console.log(res);
    return res;
}
