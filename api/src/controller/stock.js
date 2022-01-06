import stockService from '../service/stock.js'
import { searchStock, getDetail } from '../utils/stock.js'

class StockController {
  async create(ctx) {
    ctx.body = {
      code: 0,
      message: '添加成功',
      result: ''
    }
    return
    try {
      const stock = ctx.request.body
      const { stock_code } = stock
      const { id } = await stockService.createStock(stock)
    } catch (error) {
      console.log(StockRegisterError.message)
      return ctx.app.emit('error', StockRegisterError, ctx)
    }
  }
  
  async search(ctx) {
    const { keyword } = ctx.params
    const result = await searchStock(keyword)
    ctx.body = {
      code: 0,
      message: '搜索成功',
      result
    }
  }
  
  async info(ctx) {
    const { keyword } = ctx.params
    const [ result ] = await searchStock(keyword)
    if (result) {
      ctx.body = {
        code: 0,
        message: '查询成功',
        result
      }
    } else {
      ctx.body = {
        code: 400,
        message: '查询失败',
        result: ''
      }
      
    }
  }
  
  async add(ctx) {
    // 判断要添加的股票是否存在
    const { code, username, watch_prices } = ctx.request.body
    console.log(code, username, watch_prices);
    const data = await getDetail(code)
    if (!data) {
      // todo 股票不存在
    }
    try {
      const result = await stockService.add(Object.assign({ username, watch_prices }, data))
      ctx.body = {
        code: 0,
        message: '监控操作成功',
        result
      }
    } catch (error) {
      console.error(error)
      ctx.app.emit('error', '监控操作失败', ctx)
    }
  }
  
  async del(ctx) {
    try {
      const result = await stockService.del(ctx.request.body)
      ctx.body = {
        code: 0,
        message: '监控删除成功',
        result
      }
    } catch (error) {
      console.error(error)
      ctx.app.emit('error', '监控删除失败', ctx)
    }
  }
  
  async update(ctx) {
    const res = await stockService.updateById(ctx.request.body)
    if (res) {
      ctx.body = {
        code: 0,
        message: '数据修改成功',
        result: res
      }
    }
  }
  
  async findAll(ctx) {
    // 1.解析pageNum和pageSize
    const { pageNum = 1, pageSize = 10, username = '' } = ctx.request.query
    // 2.调用数据处理相关的方法
    const res = await stockService.findStocks(pageNum, pageSize, username)
    // 3.返回结果
    ctx.body = {
      code: 0,
      message: '获取监控列表成功',
      result: res
    }
  }
}

export default new StockController