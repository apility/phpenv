#! /usr/bin/env node

import colors from 'cli-color'
import parseVersion from '../version-parser.js'

import { join } from 'path'
import { exec, which } from '../lib/Shell.js'
import { resolve } from '../lib/Homebrew.js'


export default async function php(argv) {
    if (!which('brew')) {
        console.error(colors.white(colors.bgRed('Error: Homebrew not found in path')))
        process.exit(1)
    }

    try {
        const version = await parseVersion(process.cwd())
        const php = await resolve('php', await parseVersion(process.cwd()))
        if (php) {
            process.exit(await exec(join(php.path, '/bin/php'), argv))
        } else {
            throw new Error(`No installed PHP version found for ${version}`)
        }
    } catch (error) {
        console.error(colors.white(colors.bgRed(error)))
        process.exit(1)
    }
}