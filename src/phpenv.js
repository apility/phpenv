#! /usr/bin/env node

import exists from 'fs.promises.exists'
import colors from 'cli-color'

import { join, dirname } from 'path'
import { readFile, writeFile, unlink } from 'fs/promises'
import { fileURLToPath } from 'url';
import { resolve, getVersions } from './lib/Homebrew.js'

async function writeEnvFile(path, arg = '*') {
    const envFile = join(path, '.phpenv')

    if (arg === undefined) {
        return console.log(await version(path))
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
    console.log(`   local      Set or show the local application-specific PHP version`)
    console.log(`   global     Set or show the global PHP version`)
    console.log(`   version    Show the current PHP version and its origin`)
    console.log(`   versions   List installed PHP versions`)
    console.log('')
    console.log('For full documentation, see: https://github.com/apility/phpenv#readme')
}

async function printVersion(path) {
    try {
        const env = await version(path, true)
        const php = await resolve('php', env.version)
        console.log(`${php.version} (${env.reason})`)
    } catch (error) {
        console.error(colors.white(colors.bgRed(error)))
        process.exit(1)
    }
}

export default async function phpenv(argv) {
    switch (argv[0]) {
        case '--version':
            await printPackageVersion()
            return process.exit(0)
        case 'version':
            await printVersion(process.cwd())
            return process.exit(0)
        case 'versions':
            (await getVersions('php'))
                .map(formula => formula.version)
                .forEach(version => console.log(`  ${version}`))
            return process.exit(0)
        case 'local':
            if (argv[1]) {
                await writeEnvFile(process.cwd(), argv[1])
            } else {
                await printVersion(process.cwd())
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

async function systemVersion(explain = false) {
    const latest = (await getVersions('php')).shift()

    if (latest) {
        return explain ? { reason: 'system', version: latest.version } : latest.version
    }

    return explain ? { reason: 'system', version: '*' } : '*'
}

export async function version(path, explain = false) {
    const cwd = path.split('/')

    while (cwd.length) {
        const path = cwd.join('/')
        const phpenv = join(path, '.phpenv')

        if (await exists(phpenv)) {
            const version = (await readFile(phpenv, 'utf8')).toString().trim()

            if (version && version.length) {
                return explain ? { reason: phpenv, version } : version
            }
        }

        cwd.pop()
    }

    if (process.env.PHP_VERSION && process.env.PHP_VERSION.trim()) {
        return explain ? { reason: 'ENV: PHP_VERSION', version: process.env.PHP_VERSION.trim() } : process.env.PHP_VERSION.trim()
    }

    return systemVersion(explain)
}

