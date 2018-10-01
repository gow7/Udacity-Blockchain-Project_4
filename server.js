'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const BC = require('./simpleChain');
const validate = require('./validation');

const server = new Hapi.server({
    port: 8000,
    host: 'localhost'
});

server.route({
    method: '*',
    path: '/',
    handler: (request, h) => {
        return `<h1>Welcome to Project on Build a Private Blockchain Notary Service!</h1>
        <h3>Supported methods</h3>
        <b>POST</b> /requestValidation<br>
        <b>POST</b> /message-signature/validate<br>
        `;
    }
});
/*
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
            return await BC.getBlock(request.params.height);
        } catch (error) {
            if (error.type === 'NotFoundError') {
                return h.response('Height Not Found').code(404);
            }
        }
    }
});

server.route({
    method: 'POST',
    path: '/block',
    options: {
        validate: {
            payload: {
                body: Joi.string().trim().required()
            }
        }
    },
    handler: async (request, h) => {
        try {
            return h.response(await BC.addBlock(request.payload.body.trim())).code(201);
        } catch (error) {
            return h.response(error.name + " " + error.message).code(500);
        }
    }
});
*/
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