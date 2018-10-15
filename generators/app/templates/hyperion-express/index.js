// helper package for parsing command arguments
const program = require('commander');
const packageJson = require('./package.json');
// require the hyperion middleware, pass the required arguments to connect to the database
// the second parameter is optional, if you specify it it will include specialized APIs like the one for LiveTrack Mobile (ltm)
const hyperion = require('@magaya/hyperion-express-middleware').middleware(process.argv,'');
// require the express framework and create an instance of it
const app = require('express')();
// helper package to get the body of requests
const bodyParser = require("body-parser");

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

// apply the middleware in the application
app.use(hyperion);
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