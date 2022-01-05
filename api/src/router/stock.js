import Router from '@koa/router'
import stockController from '../controller/stock.js'

const router = new Router({prefix:'/stocks'})

// 搜索股票
router.get('/:keyword', stockController.search)
// 获取单只股票信息(名称、代码、当前价格、涨跌幅等)
router.get('/info/:keyword', stockController.info)
// 添加监控
router.post('/add', stockController.add)
// 暂停监控
router.post('/del', stockController.del)
// 更新监控
router.patch('/', stockController.update)
// 获取监控列表
router.get('/', stockController.findAll)

export { router }