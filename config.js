const bot = {
  http: 'http://127.0.0.1:5700',
  ws  : 'ws://127.0.0.1:6700',
}

const plugin = {
  'tips': {},
  'almanac': {},
  'board': {},
  // 'dapan': {}, // 不好使 发送图片失败
  'dog': {},
  // 'douyin': {},
  'fanyi': {},
  // 'fund': {},
  'mm': {},
  // 'recall': {}, // 获取不到撤回的消息
  'sign': {},
  'setu': {},
  'stock': {},
  'wallpaper': {},
  'weibo': {}
}

export { bot, plugin }
