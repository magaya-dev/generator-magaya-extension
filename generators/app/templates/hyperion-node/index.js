// helper package for parsing command arguments
const program = require('commander');
const packageJson = require('./package.json');
// require hyperion helper package
const hyperion = require('@magaya/hyperion-node')(process.argv, '');

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

console.log(`App started on port ${program.port}...`);

if (hyperion.dbx) {
    console.log('Hyperion is defined!');
}
else {
    console.log(`Hyperion is not defined :'(`);
}