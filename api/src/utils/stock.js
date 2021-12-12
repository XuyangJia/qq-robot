import fetch from 'node-fetch'

export async function getDetail(code) {
  // 0: 深证A股  1: 上证A股  116: 港股  153: 美股
  const secids = [`0.${code}`, `1.${code}`, `116.${code}`, `153.${code}`]
  for (let j = 0; j < secids.length; j++) {
    const secid = secids[j];
    try {
      const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&invt=2&fltt=2&fields=f43,f57,f58,f170`)
      const { data } = await response.json()
      if (data) return {
        code: data.f57,
        name: data.f58,
        price: data.f43,
        change: data.f170,
      }
    } catch (error) {
    }
  }
  return null
}

export async function searchStock(keyword) {
  try {
    const searchapi = `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${keyword}&type=0&pi=1&ps=30&token=32A8A21716361A5A387B0D85259A0037`
    const response = await fetch(searchapi)
    const { Data } = await response.json()
    // Type 1 AB股 2 指数 3 板块 4 港股 5 美股 8 基金
    if (!Data) return []
    const { Datas } =  Data.filter(({ Type }) => Type === 1)[0] || {} // 筛选出A股的股票
    if (!Datas || !Datas.length) return []
    return await Promise.all(
      Datas.map(({ Code }) => getDetail(Code))
    )
  } catch (error) {
    console.log('error', '股票模糊查询失败', error)
    return []
  }
}
