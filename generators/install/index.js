const Generator = require('yeoman-generator');
const yosay = require('yosay');
const validation = require('../app/validation');
const path = require('path');
const fs = require('fs-extra');

const copyFilterFunc = (src, dest) => {
    const filename = path.basename(src);

    if(filename == "." || filename == ".." || filename == ".gitignore" || filename == ".git" || filename == ".vscode" || filename == "node_modules")
        return false;

    return true;
}
  

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }
    
    initializing() {
        this.log(yosay('Welcome to the Magaya Extensions development installer!'));

        this.extensionInstalled = false;
    }

    async prompting() {
        const currentFolder = process.cwd();
        this.answers = await this.prompt([{
            type    : 'input',
            name    : 'extensionFolder',
            message : 'Your local extension folder',
            default : currentFolder,
            validate: validation.validateNonEmpty
          }, {
            type    : 'input',
            name    : 'magayaFolder',
            message : 'Magaya installation folder',
            default : 'C:\\Program Files (x86)\\Magaya Corp\\Magaya Cargo System',
            validate: validation.validateNonEmpty
          }
        ]);

        this.answers.instance = 'none';
        const csInstances = this._getCsInstances();
        if (csInstances.length > 0) {
            const choices = csInstances.map((current) => {
                return {
                    name: current,
                    value: current
                };
            });
            choices.push({
                name : 'None',
                value : 'none'
            });
            const answer = await this.prompt([{
                type    : 'list',
                name    : 'instance',
                message : 'Choose CS where to install the extension',
                choices : choices
              }
            ]);
            this.answers.instance = answer.instance;
        }
    }

    _getCsConfigRootFolder() {
        return path.join(this.answers.magayaFolder, 'cs-config');;
    }

    _getCsInstances() {
        let instances = [];
        if (!fs.existsSync(this.answers.magayaFolder))
            return instances;
        
        const configPath = this._getCsConfigRootFolder();
        let files = fs.readdirSync(configPath);
        for(let i = 0; i < files.length; i++) {
            let current = fs.lstatSync(path.join(configPath, files[i]));
            if(current.isDirectory()) {
                instances.push(files[i]);
            }
        }

        return instances;
    }

    writing() {
        if (!fs.existsSync(this.answers.magayaFolder) || !fs.existsSync(this.answers.extensionFolder))
            return;

        const configJsonFile = path.join(this.answers.extensionFolder, 'extension.config.json');
        if (fs.existsSync(configJsonFile)) {
            this.extensionConfig = fs.readJSONSync(configJsonFile);
        }

        const extensionFolder = this._getExtensionDestinationFolder();
        if (!fs.existsSync(extensionFolder)) {
            fs.mkdirSync(extensionFolder);
        }

        fs.copySync(this.answers.extensionFolder, extensionFolder, { filter: copyFilterFunc });

        this.extensionConfig.launch.main = './index.js';

        const extensionConfigFile = path.join(extensionFolder, 'extension.config.json');
        fs.writeJSONSync(extensionConfigFile, this.extensionConfig, {
            spaces : 4
        });

        this._ensureExtensionInCs();
    }

    _ensureExtensionInCs() {
        if (this.answers.instance === 'none')
            return;

        if (!fs.existsSync(this.answers.magayaFolder))
            return;
        
        const configPath = this._getCsConfigRootFolder();
        const jsonFile = path.join(configPath, this.answers.instance, 'cs.config.json');
        if (!fs.existsSync(jsonFile))
            return;
        
        let csConfig = fs.readJSONSync(jsonFile);
        if (!csConfig.extensions)
            csConfig.extensions = [];

        const extConfig = this.extensionConfig;
        const found = csConfig.extensions.find(function(element) {
            if (!element.id)
                return false;
            return element.id.company === extConfig.id.company && element.id.name === extConfig.id.name;
        });
        if (found)
            return;

        csConfig.extensions.push({
            id : extConfig.id,
            enabled : true,
            instances : 1
        });

        fs.writeJSONSync(jsonFile, csConfig, {
            spaces : 4
        });
    }

    install() {
        if (!fs.existsSync(this.answers.magayaFolder))
            return;

        const extensionFolder = this._getExtensionDestinationFolder();
        if (!fs.existsSync(extensionFolder)) {
            return;
        }

        process.chdir(extensionFolder);

        this.installDependencies({
            npm: true,
            bower: false
        });

        this.extensionInstalled = true;
    }

    _getExtensionDestinationFolder() {
        const folder = path.join(this.answers.magayaFolder, 'extensions');
        if (!this.extensionConfig || !this.extensionConfig.id)
            return folder;

        return path.join(folder, `${this.extensionConfig.id.company}-${this.extensionConfig.id.name}`);
    }

    _getExtensionDisplayName() {
        if (!this.extensionConfig)
            return '';
        
        if (this.extensionConfig.interface && this.extensionConfig.interface.title)
            return this.extensionConfig.interface.title;
        
        if (this.extensionConfig.id && this.extensionConfig.id.name)
            return this.extensionConfig.id.name;

        return '';
    }

    end() {
        this.log('');
        if (!this.extensionInstalled) {
            this.log('Something went wrong during the installation of the extension.');
        }
        else {
            this.log(`Your extension '${this._getExtensionDisplayName()}' has been installed!`);
            if (this.answers.instance !== 'none') {
                this.log('');
                this.log('Restart the Communication Suite to launch your extension.');
            }
        }
        this.log('\r\n');
    }
};