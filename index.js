const ig = require('./commands/instagram');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Where we will keep books
let books = [];

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/dolar-price', (req, res) => {
    (async() => {
        await ig.initializeDebug();

        await ig.login('mari.posada_', 'M24j631r089B.');

        await ig.scrapp();

        await ig.grayScale();

        let price = await ig.recognize();

        console.log(price);

        // Sending 200 when not found something is a good practice
        res.status(200).send({
            status: 200,
            message: 'El promedio es de: Bs. ' + price,
        });
    })()
});


app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));