import fetch from 'node-fetch'


async function getDetail(code) {
  // 0:  1:  116: 港股  153: 美股
  const secids = [`0.${code}`, `1.${code}`, `116.${code}`, `153.${code}`]
  for (let j = 0; j < secids.length; j++) {
    const secid = secids[j];
    const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287,f292`)
    const { data } = await response.json()
    if (data) return data
  }
  return null
}

async function test() {
  const response = await fetch('http://65.push2.eastmoney.com/api/qt/clist/get?pn=2&pz=500&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80&fields=f3,f4,f12,f14')
  const { data: { diff } } = await response.json()
  const ids = diff.map(({f12}) => f12)
  console.log(ids.length)
  const datas = await Promise.all(ids.map(getDetail))
  
  console.log(datas.map(a=>a['f107']).join())
}
test()