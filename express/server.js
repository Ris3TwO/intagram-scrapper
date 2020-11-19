'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const ig = require('./instagram');

const router = express.Router();
router.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>¡Funcionando correctamente!</h1>');
    res.end();
});
router.get('/updateDolarPrice', (req, res) => {
    (async() => {
        await ig.initialize();

        await ig.login('mari.posada_', 'M24j631r089B.');

        await ig.scrapp();

        await ig.grayScale();

        let price = await ig.recognize();

        console.log(price);

        // Sending 200 when not found something is a good practice
        res.json({
            status: 200,
            message: 'El promedio es de: Bs. ' + price,
        });
    })()
});

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router); // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);