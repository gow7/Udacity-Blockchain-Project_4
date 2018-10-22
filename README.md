# Project 4: Build a Private Blockchain Notary Service!

This web service will provide a few new features to your users. The goal is to allow users to notarize star ownership using their blockchain identity. Below are the new features you will build into your application.

1:Notarize	Users will be able to notarize star ownership using their blockchain identity.  
2:Verify Wallet Address	Your application will provide a message to your user allowing them to verify their wallet address with a message signature.  
3:Register a Star	Once a user verifies their wallet address, they have the right to register the star.  
4:Share a Story	Once registered, each star has the ability to share a story.  
5:Star Lookup	Users will be able to look up their star by hash, block height, or wallet address.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Frameworks used

hapi[https://www.npmjs.com/package/hapi] framework is used to expose the RESTful Web API.
joi[https://www.npmjs.com/package/joi] is used to validation javascript objects. We use this to validate all the imputs to RESTful Web API.
crypto-js[https://www.npmjs.com/package/crypto-js] is a library for crypto standards. We use this to to generate SHA256 has in this project.
lever[https://www.npmjs.com/package/level] is used to store the blockchain.
bitcoinjs-message[https://www.npmjs.com/package/bitcoinjs-message] is used to verify bitcoin message.
level-sublevel[https://www.npmjs.com/package/level-sublevel] is used to index the values for search
level-search[https://www.npmjs.com/package/level-search] is used to search the level db values

### Configuring your project

- Use NPM to install all the dependencies defined in package.json using the following command. If this step is successful you can skip to next section to test the application.
```
npm install
```
- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install level-sublevel with --save flag
```
npm install level-sublevel --save
```
- Install level-search with --save flag
```
npm install level-search --save
```
- Install hapi with --save flag
```
npm install hapi --save
```
- Install joi with --save flag
```
npm install joi --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```

## Testing

To test code:  
1: Open a command prompt or shell terminal after install node.js.  
2: Start node session with server.js.
```
node server.js
```
3: Start Postman  
4: Do a GET request to [http://localhost:8000/block/0] to get the genesis block details.  
5: Do a POST request to [http://localhost:8000/requestValidation] with following. This will return a message to sign to validate the user.
```
Sample Request
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}

Sample Response
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
```
6: Do a POST request to [http://localhost:8000/message-signature/validate] with signed message. This will return whether message signature is valid or not.
```
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}

Sample Response
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```
7: Do a POST request to [http://localhost:8000/block] with star to register. This will return the message and height after successfull registration.
```
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}

Sample Response
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```
8: Do a GET request to [http://localhost:8000/block/{height}] replace the hight with the value returned from previour response and make sure returned value is same as previous one.  
9: Do a GET request to [http://localhost:8000/stars/hash:{hash}] replace the hash with the value returned from previour response and make sure returned value is same as previous one.  
10: Do a GET request to [http://localhost:8000/stars/address:{address}] replace the address with your address and make sure returned all the stars registred with this address.
