import fetch from 'node-fetch'
import { load } from 'cheerio'

const ICON_MAP = {
  boil: '沸',
  new: '新',
  recommend: '荐',
  hot: '热',
}

function searchWeibo(q) {
  return [
    {
      type: 'text',
      data: {
        text: `https://s.weibo.com/weibo?q=${encodeURIComponent(q)}`,
      },
    },
  ]
}

async function listResou() {
  const response = await fetch('https://s.weibo.com/top/summary?cate=realtimehot', {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'cookie': 'SUB=_' 
    }
  })
  const htmlData = await response.text()
  const $ = load(htmlData)
  return [...$('.list_a > li')]
  .map((item, index) => {
    const title = $(item).find('span').text()
    const num = $(item).find('span > em').text()
    return {
      title: title.replace(num, ' ') + num,
      type:
        index === 0
          ? '顶'
          : ICON_MAP[
              ($(item).find('i').attr('class') || '').replace(
                'icon icon_',
                ''
              )
            ] || '',
      url: $(item).find('a').attr('href'),
    }
  })
  .filter(item => item.type !== '荐')
  .slice(0, 10)
}

export async function getDetail(search) {
  try {
    if (search) {
      return searchWeibo(search)
    }
    const text = '=====  微博热搜  =====\n' + (await listResou()).map(item => item.title.trim()).join('\n')
    return [
      {
        type: 'text',
        data: { text }
      }
    ]
  } catch (e) {
    console.error('[weibo]', e)
    return [
      {
        type: 'text',
        data: {
          text: '微博服务器瘫痪了~',
        },
      },
    ]
  }
}