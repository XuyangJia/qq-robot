const bot = {
  http: 'http://127.0.0.1:5700',
  ws  : 'ws://127.0.0.1:6700',
}

const plugin = {
  './plugin/almanac': {},
  // './plugin/dapan': {}, // 不好使 发送图片失败
  './plugin/dog': {},
  './plugin/mm': {},
  './plugin/recall': {},
  './plugin/weibo': {},
  './plugin/stock': {},
  './plugin/tips': {}
}

export { bot, plugin }
