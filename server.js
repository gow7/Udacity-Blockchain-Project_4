'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const BC = require('./simpleChain');
const validate = require('./validation');

const starRegistrationSchema = {
    address: Joi.string().trim().required(),
    star: {
        ra: Joi.string().trim().required(),
        dec: Joi.string().trim().required(),
        mag: Joi.string().trim(),
        constellation: Joi.string().trim(),
        story: Joi.string().trim().max(500, 'ascii')
    }
};

const server = new Hapi.server({
    port: 8000,
    host: 'localhost'
});

async function find(keys, h) {
    try {
        const res = await BC.find(keys);
        res.forEach(element => {
            if (element.body.star.story !== undefined) {
                element.body.star.storyDecoded = Buffer.from(element.body.star.story, 'hex').toString('ascii');
            }
        });

        if (res.length === 0) {
            return h.response('Not Found').code(404);
        } else {
            return res;
        }
    } catch (error) {
        if (error.type === 'NotFoundError') {  
            return h.response('Not Found').code(404);
        } else {
            throw error;
        }
    }
}

server.route({
    method: '*',
    path: '/',
    handler: (request, h) => {
        return `<h1>Welcome to Project on Build a Private Blockchain Notary Service!</h1>
        <h3>Supported methods</h3>
        <b>POST</b> /requestValidation<br>
        <b>POST</b> /message-signature/validate<br>
        <b>POST</b> /block<br>
        <b>GET</b> /block/[height]<br>
        <b>GET</b> /stars/hash:[hash]<br>
        <b>GET</b> /stars/address:[address]<br>
        `;
    }
});

server.route({
    method: 'GET',
    path: '/block/{height}',
    options: {
        validate: {
            params: {
                height: Joi.number().integer().required()
            }
        }
    },
    handler: async (request, h) => {
        try {
            const res = await BC.getBlock(request.params.height);
            if (res.body.star && res.body.star.story) {
                res.body.star.storyDecoded = Buffer.from(res.body.star.story, 'hex').toString('ascii');
            }
            return res;
        } catch (error) {
            if (error.type === 'NotFoundError') {
                return h.response('Height Not Found').code(404);
            }
        }
    }
});

server.route({
    method: 'GET',
    path: '/stars/hash:{hash}',
    options: {
        validate: {
            params: {
                hash: Joi.string().trim().required()
            }
        }
    },
    handler: (request, h) => {
        const res = find(['hash', request.params.hash], h);
        if (Array.isArray(res)) {
            return res.pop();
        } else {
            return res;
        }
    }
});

server.route({
    method: 'GET',
    path: '/stars/address:{address}',
    options: {
        validate: {
            params: {
                address: Joi.string().trim().required()
            }
        }
    },
    handler: (request, h) => {
        return find(['body', 'address', request.params.address], h);
    }
});

server.route({
    method: 'POST',
    path: '/block',
    options: {
        validate: {
            payload: Joi.object(starRegistrationSchema)
        }
    },
    handler: async (request, h) => {
        try {
            const req = request.payload;
            if (validate.registeredStar(req.address)) {
                if (req.star.story !== undefined) {
                    req.star.story = Buffer.from(req.star.story, 'ascii').toString('hex');
                }
                return h.response(await BC.addBlock(req)).code(201);
            } else {
                return h.response("You can reginter one start after validating the signature, please start requestValidation and validate the signature to add star").code(401);
            }
        } catch (error) {
            return h.response(error.name + " " + error.message).code(500);
        }
    }
});

server.route({
    method: 'POST',
    path: '/requestValidation',
    options: {
        validate: {
            payload: {
                address: Joi.string().trim().required()
            }
        }
    },
    handler: async (request, h) => {
        return h.response(validate.newRequest(request.payload.address));
    }
});

server.route({
    method: 'POST',
    path: '/message-signature/validate',
    options: {
        validate: {
            payload: {
                address: Joi.string().trim().required(),
                signature: Joi.string().trim().required()
            }
        }
    },
    handler: async (request, h) => {
        const res = validate.sigValidate(request.payload.address, request.payload.signature);
        if (res.registerStar === true) {
            return h.response(res);
        } else {
            return h.response(res).code(401);
        }
    }
});


const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();