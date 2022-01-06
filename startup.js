import pm2 from 'pm2'

async function startApp (script, name) {
  return new Promise((resolve, reject) => {
    pm2.start({script, name}, (err, apps) => {
      if (err) reject(new Error(err))
      else {
        pm2.disconnect()
        resolve(apps)
      }
    })
  })
}

pm2.connect(async function(err) {
  if (err) {
    console.error(err)
    process.exit(2)
  }
  // // 启动API服务
  // console.log('准备启动API服务')
  // await startApp('./api/index.js', 'api')
  // console.log('API服务已启动')
  
  // 启动机器人cqhttp服务
  console.log('准备启动cqhttp服务')
  await startApp('npm run serve', 'server')
  console.log('cqhttp服务已启动')
  
  // // 启动机器人
  // console.log('准备启动机器人')
  // await startApp('./index.js', 'robot')
  // console.log('机器人服务已启动')
  // pm2.start({
  //   script    : ,
  //   name      : 'api'
  // }, function(err, apps) {
  //   if (err) {
  //     console.error(err)
  //     return pm2.disconnect()
  //   }

  //   pm2.list((err, list) => {
  //     console.log(err, list)

  //     pm2.restart('api', (err, proc) => {
  //       // Disconnects from PM2
  //       pm2.disconnect()
  //     })
  //   })
  // })
})
