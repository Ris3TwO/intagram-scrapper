const fs = require('fs');
const Jimp = require('jimp');
const https = require('https');
const pupperteer = require('puppeteer');
const Tesseract = require('tesseract.js');

const BASE_URL = 'https://instagram.com/';

const instagram = {
    browser: null,
    page: null,

    initializeDebug: async() => {
        instagram.browser = await pupperteer.launch({
            headless: false
        });

        instagram.page = await instagram.browser.newPage();
    },

    initialize: async() => {
        instagram.browser = await pupperteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-gpu', "--fast-start", "--disable-extensions"]
        });

        instagram.page = await instagram.browser.newPage();
    },

    login: async(username, password) => {
        await instagram.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

        await instagram.page.waitForTimeout(5000);

        /* Writing the username and password */
        await instagram.page.type('input[name="username"]', username, { delay: 50 });
        await instagram.page.type('input[name="password"]', password, { delay: 50 });

        /* Clicking on the login button */
        let loginButton = await instagram.page.$x('//div[contains(text(), "Iniciar sesión")]');
        await loginButton[0].click();
    },

    scrapp: async() => {
        await instagram.page.waitForTimeout(5000);

        // go to Instagram web profile
        await instagram.page.goto(BASE_URL + 'enparalelovzla', { waitUntil: 'networkidle2' });

        // get recent posts (array of url and photo)
        let recentPosts = await instagram.page.evaluate(() => {
            let results = [];

            // loop on recent posts selector
            document.querySelectorAll('div[style*="flex-direction"] div > a').forEach((el) => {
                // init the post object (for recent posts)
                let post = {};

                // fill the post object with URL and photo data
                post.url = 'https://www.instagram.com' + el.getAttribute('href');
                post.photo = el.querySelector('img').getAttribute('src');

                // add the object to results array (by push operation)
                results.push(post);
            });

            // recentPosts will contains data from results
            return results;
        });

        console.log({ 'recent_posts': recentPosts[0] });

        rmDir = function(dirPath, removeSelf) {
            if (removeSelf === undefined)
                removeSelf = true;
            try { var files = fs.readdirSync(dirPath); } catch (e) { return; }
            if (files.length > 0)
                for (var i = 0; i < files.length; i++) {
                    var filePath = dirPath + '/' + files[i];
                    if (fs.statSync(filePath).isFile())
                        fs.unlinkSync(filePath);
                    else
                        rmDir(filePath);
                }
            if (removeSelf)
                fs.rmdirSync(dirPath);
        };

        await rmDir('./img', false);

        const download = (url, destination) => new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destination);

            https.get(url, response => {
                response.pipe(file);

                file.on('finish', () => {
                    file.close(resolve(true));
                });
            }).on('error', error => {
                fs.unlink(destination);

                reject(error.message);
            });
        });

        result = await download(recentPosts[0].photo, './img/' + 'image-' + Date.now() + '.png');

        if (result === true) {
            console.log('Success:', 'has been downloaded successfully.');
        } else {
            console.log('Error:', 'was not downloaded.');
            console.error(result);
        }

        await instagram.browser.close();

    },

    grayScale: async() => {

        let image = [];
        let files = await fs.readdirSync('./img');

        files.forEach(file => {
            image.push(file)
            console.log(file);
        })

        const fichero = Jimp.read('./img/' + files[0]).then(lenna => {
                return lenna
                    .greyscale() // set greyscale
                    .write('./img/' + files[0]); // save
            })
            .catch(err => {
                console.error(err);
            });
    },

    recognize: async() => {

        let image = [];

        let files = await fs.readdirSync('./img');

        files.forEach(file => {
            image.push(file)
            console.log(file);
        })

        console.log(files[0]);

        let textDecrypt = await Tesseract.recognize(
            './img/' + files[0],
            'eng', { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            if (text !== undefined && text !== '') {
                console.log(text)
                let res = (text.includes('PM')) ? text.split("PM") : text.split("AM");
                console.log('Primer split: ', res)
                res = res[1].split(",");
                res = res[0] + "," + res[1].substring(0, 2);
                console.log('Segundo split: ', res)
                res = res.split("Bs.");
                console.log('Tercer split: ', res[1]);
                res = res[1].replace(/\r?\n|\r/g, "");
                console.log('Cuarto split: ', res)
                let finalText = res.trim();
                return finalText;
            } else {
                return 'No ha sido actualizado';
            }
        })

        return textDecrypt;
    }
}

module.exports = instagram;