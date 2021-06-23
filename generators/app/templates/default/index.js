// helper package for parsing command arguments
const {program} = require('commander');
const packageJson = require('./package.json');

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

console.log(`App started on port ${options.port}...`);