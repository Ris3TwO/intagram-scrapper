const ig = require('./commands/instagram');

(async() => {

    await ig.initializeDebug();

    await ig.login('mari.posada_', 'M24j631r089B.');

    await ig.scrapp();

    await ig.grayScale();

    await ig.recognize();

    debugger;

})()