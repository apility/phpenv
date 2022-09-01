# PHP Env

![GitHub](https://img.shields.io/github/license/apility/phpenv)
![GitHub package.json version](https://img.shields.io/github/package-json/v/apility/phpenv)

Use phpenv to manage PHP versions on a project basis.

## Requirements

* Homebrew
* Node.js
* NPM

The homebrew package manager is required to use phpenv (for now). Support for other package manager will be added later.

## Background

If you need to maintain multiple PHP versions on a single machine, you can use phpenv to manage them.

Phpenv works by letting you specify a per directory PHP version. This is done by either creating a `.php-version` file in the root of your project, or by specifying a version in `composer.json`.
This file contains the version of PHP you want to use for that project.

The version is determined by a semver version constraint. This means you can specify a version like `5.6` or `7.0.0` or `^8.0`.

## Installation

```bash
npm install -g @apility/phpenv --force
```

**Notice**: The force flag is intentional, as this package will install a shim for the `php` command which exectures the correct PHP version.

## Usage

### Setting local version

```bash
phpenv local "^8.2"
```

This creates a `.phpenv` file in the current directory.

When the shimmed `php` command in this package is executed, it will parse the environment to determine which PHP binary to actually run.

### Setting global version

You can either set the environment variable `PHP_VERSION` to the desired version, or use the `phpenv global` command.

```bash
phpenv global "^8.2"
```

### Specifying version

You can either specify an exact version, or use semver to specify a constraint (recommended).

```
phpenv versions
```