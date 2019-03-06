// helper package for parsing command arguments
const program = require('commander');
const packageJson = require('./package.json');
const extConfigJson = require('./extension.config.json');
// require the hyperion middleware
const hyperionMiddleware = require('@magaya/hyperion-express-middleware');
// create the hyperion middleware for express.js, pass the required arguments to connect to the database
// the second parameter is the unique identifier of the extension connecting to the database
// it can also mean including specialized APIs like the one for LiveTrack Mobile (magaya-ltm)
const middleware = hyperionMiddleware.middleware(process.argv, `${extConfigJson.id.company}-${extConfigJson.id.name}`);
// require the express framework and create an instance of it
const app = require('express')();
// helper package to get the body of requests
const bodyParser = require("body-parser");
// require the config helper
const fsHelper = require('@magaya/extension-fs-helper');
// helper for paths
const path = require('path');
// helper for filesystem
const fs = require('fs');

program.version(packageJson.version)
    .option('-p, --port <n>', 'running port', parseInt)
    .option('-r, --root <value>', 'startup root for api')
    .option('-s, --service-name <value>', 'name for service')
    .option('-g, --gateway', 'dictates if we should be through gateway')
    .option('-i, --network-id <n>', 'magaya network id', parseInt)
    .option('--connection-string <value>', 'connection endpoint for database')
    .parse(process.argv);

if (!program.port) {
    console.log('Must submit port on which to listen...');
    process.exit(1);
} else if (!program.root) {
    console.log('Must submit root...');
    process.exit(1);
}

// let's assume this is our Magaya NetworkId
const networkId = 12345;
// retrieve the config folder for this instance of the extension
const configFolder = fsHelper.GetExtensionDataFolder(extConfigJson.id, networkId);
const configFile = path.join(configFolder, 'config.json');
// save a configuration file in the proper folder
const configJson = {
    "value" : 123
};
// write the configuration to the filesystem
fs.writeFileSync(configFile, JSON.stringify(configJson), 'utf8');

// apply the middleware in the application
app.use(middleware);
// apply other helper middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// define a route that can be consumed from a web browser
app.get(`${program.root}/test`, function(request, response) {
    const dbx = request.dbx;                // hyperion namespaces
    const algorithm = request.algorithm;    // hyperion algorithms
    const api = request.api;                // api functions (requested with the second argument at require time)
 
    response.send('Success!!');
});

// start your application in the port specified
app.listen(program.port, () => {
    console.log(`Server started on port ${program.port}...`);
});