require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes'); // Import semua routes
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

const apiKey = process.env.API_KEY; // Mengakses API key dari file .env
console.log(`API Key: ${apiKey}`);

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'], // Mengizinkan akses dari semua origin
            },
        },
    });

    // Memuat model TensorFlow
    const model = await loadModel();
    server.app.model = model;

    // Menambahkan routes ke server
    console.log('Registering routes:', routes);
    server.route(routes);

    // Middleware untuk menangani error
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }
        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.output.statusCode);
            return newResponse;
        }
        return h.continue;
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
})();
