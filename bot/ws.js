import { WebSocket } from 'ws'
import { bot } from '../config.js'

const socket = new WebSocket(bot.ws)

export const ws = {
  send(action, params) {
    socket.send(JSON.stringify({ action, params }))
  },
  listen(callback) {
    socket.on('message', data => {
      try {
        callback(JSON.parse(data))
      } catch (e) {
        console.error(e)
      }
    })
  }
}
