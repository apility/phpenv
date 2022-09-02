import { spawn, execSync } from 'child_process'

export class Shell {
    static async exec(path, argv, options = { stdio: 'inherit' }) {
        return await new Promise(async (resolve, reject) => {
            try {
                const child = spawn(path, argv, options)

                child.on('exit', function (code) {
                    resolve(code)
                })

                child.on('error', function (err) {
                    reject(err)
                })
            } catch (error) {
                reject(error.message)
            }
        })
    }

    static which(command) {
        try {
            execSync(`which ${command}`)
            return true
        } catch (error) {
            return false
        }
    }
}

export const exec = Shell.exec
export const which = Shell.which