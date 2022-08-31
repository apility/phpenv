import { readdir, realpath } from 'fs/promises'
import { join, basename } from 'path'
import semver from 'semver'

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
                version: basename(path),
                path,
            })).sort((a, b) => semver.compare(b.version, a.version))
    }

    static async resolve(formula, version) {
        const resolved = (await Homebrew.getVersions(formula))
            .find(formula => semver.satisfies(formula.version, version))

        if (resolved) {
            return resolved
        }

        throw new Error(`${formula}@${version} not installed`)
    }
}

export const resolve = Homebrew.resolve
export const getVersions = Homebrew.getVersions