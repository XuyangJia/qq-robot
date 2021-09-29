# api

## 沪深个股 http://quote.eastmoney.com/center/gridlist.html#hs_a_board
api: http://53.push2.eastmoney.com/api/qt/clist/get
params:
  po: 排序 0 从小到大 1 从大到小
  fid: 根据哪个字段排序 f3 涨跌幅
  fs: 沪深A股 m:1+t:2,m:1+t:23,m:0+t:6,m:0+t:80
      上证A股 m:1+t:2,m:1+t:23
      科创板 m:1+t:23
      深证A股 m:0+t:6,m:0+t:80
      创业板 m:0+t:80
      新股 m:0+f:8,m:1+f:8 
      沪股通 b:BK0707
      深股通 b:BK0804
  fields: 