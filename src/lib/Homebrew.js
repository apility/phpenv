import { exec } from './Shell.js'
import { execSync } from 'child_process'
import { readdir, realpath } from 'fs/promises'
import { join, basename } from 'path'
import semver from 'semver'
import { oraPromise } from 'ora'

export default class Homebrew {
    static get repository() {
        return join(process.env.HOMEBREW_REPOSITORY ?? '/opt/homebrew', 'opt')
    }

    static get cellar() {
        return process.env.HOMEBREW_CELLAR ?? '/opt/homebrew/Cellar'
    }

    static async getVersions(formula) {
        const repository = Homebrew.repository
        const filter = new RegExp(`^${formula}(@.+)?$`)

        const paths = await Promise.all(
            (await readdir(repository))
                .filter(file => filter.test(file))
                .map(async file => await realpath(join(repository, file))))

        return [...new Set(paths)]
            .map(path => ({
                formula,
                version: basename(path).replace(/[_]/, '+'),
                path,
            })).sort((a, b) => semver.compare(b.version, a.version))
    }

    static async resolve(formula, version) {
        const resolved = (await Homebrew.getVersions(formula))
            .find(formula => semver.satisfies(formula.version, version))

        if (resolved) {
            return resolved
        }
    }

    static async listInstallableVersions(formula) {
        const versions = execSync(`brew search '/\\\/?${formula}@.+/' | sed 's/ +/\\n/g' | sed -n '1d;p'`)
            .toString()
            .split(/\r?\n/)
            .filter(formula => formula)
            .map(formula => basename(formula).replace(/[_]/, '+'))
            .sort((a, b) => b.localeCompare(a))

        return [...new Set(versions)]
    }

    static async install(formula, version = null) {
        if (version && version[0] === '^') {
            version = version.substring(1)
        }

        const formulaString = version ? `${formula}@${version}` : formula
        const argv = ['install', formulaString, '--quiet']

        return await oraPromise(exec(`brew`, argv), `Installing ${formulaString}`)
    }
}

export const resolve = Homebrew.resolve
export const getVersions = Homebrew.getVersions
export const listInstallableVersions = Homebrew.listInstallableVersions
export const install = Homebrew.install