'use strict';

const bitcoinMessage = require('bitcoinjs-message');
const activeAddresses = {};
const validatedAddresses = {};

const currentTimeStamp = () => {
    return new Date().getTime().toString().slice(0, -3);
}

const requestTimeStamp = (address) => {
    const requestTime = activeAddresses[address];
    return requestTime === undefined ? "time-out" : requestTime;
}

const message = (address) => {
    return `${address}:${requestTimeStamp(address)}:starRegistry`;
}

const validationWindow = (address) => {
    let res = 300 - (currentTimeStamp() - activeAddresses[address]);
    return isNaN(res) ? 0 : res;
}

const response = (address) => {
    return {address: address,
        requestTimeStamp: requestTimeStamp(address),
        message: message(address),
        validationWindow: validationWindow(address)}
}

exports.newRequest = (address) => {
    if (activeAddresses[address] === undefined) {
        activeAddresses[address] = currentTimeStamp();
        setTimeout(() => {delete activeAddresses[address]}, 300000);
    }
    return response(address);
}

exports.sigValidate = (address, signature) => {
    const mess = message(address);
    const status = response(address);
    status.messageSignature = "not-valid";
    const res = {registerStar: false, status: status};
    try {
        if (bitcoinMessage.verify(mess, address, signature)) {
            validatedAddresses[address] = true;
            res.registerStar = true;
            res.status.messageSignature = "valid";
        }
    } catch (error) {
        res.status.messageSignature = error.message;

        // Testing code below need to remove when submitting
        /* validatedAddresses[address] = true;
        res.registerStar = true;
        res.status.messageSignature = "valid";
        */
    }
    console.log(res);
    return res;
}

exports.registeredStar = (address) => {
    let res = false;
    if (validatedAddresses[address] !== undefined && validatedAddresses[address]) {
        res = true;
        delete validatedAddresses[address];
    }
    return res;
}
