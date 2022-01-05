import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import yaml from 'js-yaml'

// const configDir = dirname(decodeURI(import.meta.url).replace(/^file:\/\/\//, ''))
const env = yaml.load(readFileSync('./config.yml', 'utf8'))
export { env }
