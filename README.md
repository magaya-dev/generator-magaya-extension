# Magaya Extensions Generator

The Magaya Software architecture has support for extensions to add functionality to its core components via NodeJS applications.

Starting in version 11.0, extensions can be added in different ways to the Magaya Software:
- **Background**: extend the functionality of the Communication Suite with modules that can run background processes, communicate with third party systems or display modern web applications.
- **Interactive**: extend the functionality of the Magaya Explorer by dynamically adding actions that can be triggered by the user.

This generator will help you kickstart a new extension project.

Available generators:
- magaya-extension
- magaya-extension:install

**Note**: Sub-generators are to be run from the root directory of your app. The main generator will create your project folder for you. The installer generator will deploy your extension to your local installation of Magaya.

## Getting Started

Before you begin make sure you have the [yo scaffolding tool](http://yeoman.io/learning/index.html) installed (As it is part of the Yeoman tool set you might have installed it before). To globally install *yo* you will need to use npm:

```
$ npm install -g yo
```

**Note**: Your user might not have the permissions to install package globally, so use a super user or sudo.

Once you have *yo* installed, you will need to install the *magaya-extension* generator as well:

```
$ npm install -g generator-magaya-extension
```

You are now ready to get started with the Extensions generator. The generator will help you create an extension from scratch and test it in your Magaya installation.

## Extensions Generator

To start a new project, in the Command Prompt, navigate to the directory where you want to store the code and run:

```
$ yo magaya-extension
```

This will launch the generator and prompt you with some data about the extension like company name, extension name, description and the type of project you want to create.

Then, the generator will create a folder with the name as *company name*-*extension name*

After the project is created you can open it with Visual Studio Code or any other IDE. If you selected the **Web server** or **Background only** project templates you need to change the connection string to connect to your Magaya Database.

## Installer Generator
