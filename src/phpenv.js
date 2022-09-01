#! /usr/bin/env node

import exists from 'fs.promises.exists'
import colors from 'cli-color'

import { join, dirname } from 'path'
import { readFile, writeFile, unlink } from 'fs/promises'
import { fileURLToPath } from 'url';
import { resolve, getVersions, install } from './lib/Homebrew.js'
import parseVersion from './version-parser.js'

async function writeEnvFile(path, arg = '*') {
    const envFile = join(path, '.phpenv')

    if (arg === undefined) {
        return console.log(await parseVersion(path))
    }

    if (await exists(envFile)) {
        await unlink(envFile)
    }

    if (arg !== '--unset') {
        await writeFile(envFile, arg)
    }
}

async function printPackageVersion() {
    const __filename = import.meta.url
    const __dirname = dirname(__filename)
    const packageFile = fileURLToPath(join(__dirname, '..', 'package.json'))
    const version = JSON.parse(await readFile(packageFile, 'utf8')).version
    console.log(`phpenv ${version}`)
}

async function printUsage() {
    await printPackageVersion()
    console.log(`Usage: phpenv <command> [<args>]`)
    console.log('')
    console.log(`   install    Install a PHP version`)
    console.log(`   local      Set or show the local application-specific PHP version`)
    console.log(`   global     Set or show the global PHP version`)
    console.log(`   version    Show the current PHP version and its origin`)
    console.log(`   versions   List installed PHP versions`)
    console.log('')
    console.log('For full documentation, see: https://github.com/apility/phpenv#readme')
}

async function printVersion(path) {
    try {
        const env = await parseVersion(path, true)
        const php = await resolve('php', env.version)
        if (php) {
            console.log(`${php.version} (${env.reason})`)
        } else {
            console.log(`(system) (no installed php version for ${env.version})`)
        }
    } catch (error) {
        console.error(colors.white(colors.bgRed(error)))
        process.exit(1)
    }
}

async function installPHPVersion(version) {
    return await install('php', version)
}

export default async function phpenv(argv) {
    const cwd = process.cwd()

    switch (argv[0]) {
        case '--version':
            await printPackageVersion()
            return process.exit(0)
        case 'install':
            await installPHPVersion(argv[1])
            return process.exit(0)
        case 'version':
            await printVersion(cwd)
            return process.exit(0)
        case 'versions':
            const current = await resolve('php', await parseVersion(cwd));

            (await getVersions('php'))
                .map(formula => formula.version)
                .forEach(version => {
                    console.log(` ${version === current?.version ? '* ' : '  '}${version}`)
                })
            return process.exit(0)
        case 'local':
            if (argv[1]) {
                await writeEnvFile(cwd, argv[1])
            } else {
                await printVersion(cwd)
            }
            return process.exit(0)
        case 'global':
            if (argv[1]) {
                await writeEnvFile(process.env.HOME ?? '~', argv[1])
            } else {
                await printVersion(process.env.HOME ?? '~')
            }
            return process.exit(0)
        default:
            await printUsage()
            return process.exit(1)
    }
}
