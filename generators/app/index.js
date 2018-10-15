const Generator = require('yeoman-generator');
const yosay = require('yosay');
const validation = require('./validation');
const path = require('path');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    _checkDefaultValues() {
        const rootDir = this.appname;
        let pieces = rootDir.split(' ');

        let id = '';
        let company = '';
        let name = '';
        if (pieces.length >= 2) {
            company = pieces[0];
            name = pieces[1];
            id = `${company}-${name}`;
        }

        const result = validation.validateExtensionId(id);
        if (result === true) {
            this.needToChangeDir = false;
            this.extensionConfig.company = company;
            this.extensionConfig.name = name;
        }
    }

    initializing() {
        this.log(yosay('Welcome to the Magaya Extensions generator!'));
        
        this.needToChangeDir = true;
        this.extensionConfig = Object.create(null);
        this._checkDefaultValues();
    }

    async prompting() {
        this.answers = await this.prompt([{
            type    : 'input',
            name    : 'company',
            message : 'Your company name',
            default : this.extensionConfig.company,
            validate: validation.validateNonEmpty
          }, {
            type    : 'input',
            name    : 'name',
            message : 'Your extension name',
            default : this.extensionConfig.name,
            validate: validation.validateNonEmpty
          }, {
            type    : 'input',
            name    : 'description',
            message : 'Extension description',
            default : this.extensionConfig.description,
            validate: validation.validateNonEmpty
          }, {
            type    : 'list',
            name    : 'type',
            message : 'What type of extension do you want to create?',
            choices: [{
                name: 'Web server',
                value: 'hyperion-express'
            },
            {
                name: 'Background only',
                value: 'hyperion-node'
            },
            {
                name: 'Empty project',
                value: 'default'
            }]
          }]);

        if (this.extensionConfig.company !== this.answers.company || this.extensionConfig.name !== this.answers.name) {
            this.needToChangeDir = true;
        }
        this.extensionConfig.company = this.answers.company;
        this.extensionConfig.name = this.answers.name;
        this.extensionConfig.id = `${this.extensionConfig.company}-${this.extensionConfig.name}`;
        this.extensionConfig.description = this.answers.description;
        this.extensionConfig.type = this.answers.type;
    }

    writing() {
        let context = this.extensionConfig;
        context.mainFile = `./node_modules/${context.id}/index.js`;

        this.sourceRoot(path.join(__dirname, './templates/' + context.type));

        let rootFolder = `${context.id}/`;
        if (!this.needToChangeDir) {
            rootFolder = '';
        }

        this.fs.copy(`${this.sourceRoot()}/vscode`, `${rootFolder}.vscode`);
        this.fs.copyTpl(this.sourceRoot() + '/package.json', `${rootFolder}package.json`, context);
        this.fs.copyTpl(this.sourceRoot() + '/extension.config.json', `${rootFolder}extension.config.json`, context);
        this.fs.copy(`${this.sourceRoot()}/index.js`, `${rootFolder}index.js`);
        this.fs.copy(`${this.sourceRoot()}/gitignore`, `${rootFolder}.gitignore`);
        this.fs.copy(`${this.sourceRoot()}/LICENSE`, `${rootFolder}LICENSE`);
        this.fs.copyTpl(`${this.sourceRoot()}/README.md`, `${rootFolder}README.md`, context);
    }

    install() {
        if (this.needToChangeDir) {
            process.chdir(this.extensionConfig.id);
        }

        this.installDependencies({
            npm: true,
            bower: false
        });

        this.spawnCommand('git', ['init', '--quiet']);
    }

    end() {
        this.log('');
        this.log(`Your extension '${this.extensionConfig.name}' has been created!`);
        this.log('');
        this.log('To start editing with Visual Studio Code, use the following commands:');
        this.log('');
        if (this.needToChangeDir) {
            this.log(`     cd ${this.extensionConfig.id}`);
        }
        this.log('     code .');
        this.log('');
        if (this.extensionConfig.type === 'hyperion-express' || this.extensionConfig.type === 'hyperion-node') {
            this.log('Remember to update the connection-string to your Magaya database before you start testing.');
            this.log('');
        }

        this.log('For more information, visit https://dev.magaya.com');
        this.log('');
        this.log('Happy coding!');
        this.log('\r\n');
    }
};