
import fetch from 'node-fetch'
import { stringify } from 'qs'
import { bot } from '../config.js'

export const http = {
  async send(action, params) {
    const response = await fetch(`${bot.http}/${action}?${stringify(params)}`)
    const data = await response.json()
    return data
  }
}