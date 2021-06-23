// helper package for parsing command arguments
const {program} = require('commander');
const packageJson = require('./package.json');
const extConfigJson = require('./extension.config.json');
// require the hyperion middleware
const hyperionMiddleware = require('@magaya/hyperion-express-middleware');
// create the hyperion middleware for express.js, pass the required arguments to connect to the database
// the second parameter contains the unique identifier of the extension connecting to the database
// it can also mean including specialized APIs like the one for LiveTrack Mobile (magaya-ltm)
const apiKey = '<YOUR-API-KEY-HERE>';
const middleware = hyperionMiddleware.middleware(process.argv, {
    'clientId' : `${extConfigJson.id.company}-${extConfigJson.id.name}`,
    'apiKey' : apiKey
});
// require the express framework and create an instance of it
const express = require('express');
const app = express();
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
    .option('-c, --connection-string <cs>', ' db connection string')
    .option('--no-daemon', 'pm2 no daemon option')
    .parse(process.argv);

const options = program.opts();
if (!options.port) {
    console.log('Must submit port on which to listen...');
    process.exit(1);
} else if (!options.root) {
    console.log('Must submit root...');
    process.exit(1);
}

// retrieve the config folder for this instance of the extension
const configFolder = fsHelper.GetExtensionDataFolder(extConfigJson.id, options.networkId);
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// define a route that can be consumed from a web browser
app.get(`${options.root}/test`, function(request, response) {
    const dbx = request.dbx;                // hyperion namespaces
    const algorithm = request.algorithm;    // hyperion algorithms
    const api = request.api;                // api functions (requested with the second argument at require time)
 
    response.send('Success!!');
});

// start your application in the port specified
app.listen(options.port, () => {
    console.log(`Server started on port ${options.port}...`);
});