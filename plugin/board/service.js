import fetch from 'node-fetch'
import { stringify } from 'qs'
import { table } from 'table'

const eastmoneyApi = 'https://2.push2.eastmoney.com/api/qt/clist/get'
const params = {
  pn: 1,
  pz: 20, // 获取数量
  po: 1,
  np: 1,
  fltt: 2,
  fid: 'f3',
  fs: 'm:90+t:1+f:!50', // t: 1 地域 2 行业 3 概念
  fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f140,f141,f207,f208,f209,f222',
}

async function getRank(t, pz, change) {
  const query = stringify(Object.assign({}, params, { pz, fs: `m:90+t:${t}+f:!50`}))
  const response = await fetch(`${eastmoneyApi}?${query}`)
  const { data: { diff } } = await response.json()
  const result = diff.filter(obj => obj['f3'] >= change).map((obj, index) => {
    return [index + 1, obj['f12'], obj['f14'], `${obj['f3']}%`, obj['f128'], obj['f140'], `${obj['f136']}%`]
  })
  result.unshift(['排名', '板块代码', '板块名称', '涨跌幅', '领涨股票', '股票代码', '涨跌幅'])
  const { name, key } = {
    1: { name: '地域板块', key: 'region_board' },
    2: { name: '行业板块', key: 'industry_board' },
    3: { name: '概念板块', key: 'concept_board' },
  }[t]
  const config = {
    header: { alignment: 'center', content: `==========    ${name}    ==========` },
    drawVerticalLine: () => false,
    drawHorizontalLine: () => false
  }
  return table(result, config) + `http://quote.eastmoney.com/center/boardlist.html#${key}`
}

async function getDetail(code) {
  const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=90.${code}&fields=f57,f58,f59,f152,f43,f169,f170,f46,f60,f44,f45,f168,f50,f47,f48,f49,f46,f169,f161,f117,f85,f47,f48,f163,f171,f113,f114,f115,f86,f117,f85`)
  const { data } = await response.json()
  if (data) return data
}

export async function getBoard(user_id, pz) {
  let change = -100
  // if (pz < 1) { // 按照涨跌幅查询
  //   change = pz * 10
  //   pz = 9
  // } 
  // console.log(pz, change)
  const text = `${await getRank(2, pz, change)}\n\n${await getRank(3, pz, change)}`
  return [ { type: 'text', data: { text } } ]
}