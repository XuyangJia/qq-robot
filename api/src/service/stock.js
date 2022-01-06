import Stock from "../model/stock.js"

class UserService {
  async getStock(opts, paranoid = true) {
    const res = await Stock.findOne({
      where: opts,
      paranoid
    })
    return res ? res.dataValues : null
  }
  
  async add(data) {
    const { username, code } = data
    const res = await this.getStock({ username, code }, false)
    if (!res) {
      console.log('0000000')
      // 添加监控
      await Stock.create(data)
      return '添加监控成功'
    }
    const { id } = res
    if (res.deletedAt) {
      // 恢复监控
      await Stock.restore({ where: { id } })
    }
    // 更新监控
    await Stock.update(data, { where: { id } })
    return '更新监控成功'
  }
  
  async del (opts) {
    const { id } = await this.getStock(opts) || {}
    if (!id) return 0
    return await Stock.destroy({
      where: { id }
    })
  }
  
  async findStocks (pageNum, pageSize, username) {
    const offset = (pageNum - 1) * pageSize
    const opts = username ? { username } : null
    const { count, rows } = await Stock.findAndCountAll({
      attributes: ['id', 'username', 'name', 'code', 'price', 'watch_prices', 'check_at'],
      offset, 
      limit: Number(pageSize), 
      where: opts 
    })
    return {
      pageNum,
      pageSize,
      total: count,
      list: rows
    }
  }
  
  async updateById ({ id, ...data }) {
    const res = await Stock.update(data, {
      where: { id }
    })
    return res[0]
  }
}

export default new UserService()