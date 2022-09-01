import exists from 'fs.promises.exists'
import { readFile } from 'fs/promises'
import { join } from 'path'

async function systemVersion(explain = false) {
    const latest = (await getVersions('php')).shift()

    if (latest) {
        return explain ? { reason: 'system', version: latest.version } : latest.version
    }

    return explain ? { reason: 'system', version: '*' } : '*'
}

export default async function parseVersion(path, explain = false) {
    const cwd = path.split('/')

    while (cwd.length) {
        const path = cwd.join('/')
        const phpenv = join(path, '.phpenv')
        const composer = join(path, 'composer.json')

        if (await exists(composer)) {
            const composerJson = (await readFile(composer, 'utf8'))

            try {
                const parsed = JSON.parse(composerJson)
                const version = parsed.config?.platform?.php ?? parsed.require?.php ?? null

                if (version && version.length) {
                    return explain ? { reason: composer, version } : version
                }
            } catch (e) {
                console.warn(`Invalid composer.json file detected at ${composer}, skipping`)
            }
        }

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

