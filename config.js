const bot = {
  http: 'http://127.0.0.1:5700',
  ws  : 'ws://127.0.0.1:6700',
}

const plugin = {
  './plugin/almanac': {},
  './plugin/dapan': {},
  './plugin/dog': {},
  './plugin/recall': {}
}

export { bot, plugin }
