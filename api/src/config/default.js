import { readFileSync } from 'fs'
import yaml from 'js-yaml'

const env = yaml.load(readFileSync('./config.yml', 'utf8'))
export { env }
