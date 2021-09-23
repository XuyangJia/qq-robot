import fetch from 'node-fetch'
import { stringify } from 'qs'
import iconv from 'iconv-lite'

export async function getDetail(date = new Date) {
  const params = {
    tn: 'wisetpl',
    resource_id: '39043',
    query: `${date.getFullYear()}年${date.getMonth() + 1}月`,
  }
  const response = await fetch(`https://opendata.baidu.com/api.php?${stringify(params)}`)
  const buffer = await response.buffer()
  const { data:[{ almanac }] } = JSON.parse(iconv.decode(buffer, 'gbk'))
  const info = almanac.find(obj => {
    return parseInt(obj.day) === date.getDate()
    && parseInt(obj.month) === date.getMonth() + 1
    && parseInt(obj.year) === date.getFullYear()
  })
  const text = [
    `${info.year}-${info.month}-${info.day}`,
    `星期${info.cnDay}`,
    `${info.lMonth}月${info.lDate}`,
    `${info.gzYear}年 ${info.animal}`,
    `${info.gzMonth}月 ${info.gzDate}日`,
    `${info.term}`,
    `${info.value}`,
    `宜: ${info.suit}`,
    `忌: ${info.avoid}`,
  ].join('\n')
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}