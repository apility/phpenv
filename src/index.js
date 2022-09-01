#! /usr/bin/env node

import { basename } from 'path'

import phpenv from './phpenv.js'
import php from './shims/php.js'

function main(argv) {
    if (['index.js', 'phpenv'].includes(basename(process.argv[1]))) {
        return phpenv(argv)
    }

    return php(argv)
}

main(process.argv.slice(2))