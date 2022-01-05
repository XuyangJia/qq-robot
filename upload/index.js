import { basename } from 'path'
import { createReadStream } from 'fs'
import COS from 'cos-nodejs-sdk-v5'

const cos = new COS({
  SecretId: 'AKIDlKdgU3mOCJDta2MH6hQxGK7ez4sYuBBz',
  SecretKey: 'jCOJ2WfX9TbS2LN9es0sXv2sTot0qSr0'
})
const Bucket = 'sg-web-1300484698'
const Region = 'ap-beijing'
async function upload (file) {
  const fn = basename(file)
  const fileLink = 'http://sg-web-1300484698.cos-website.ap-beijing.myqcloud.com/temp/' + fn
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket,
      Region,
      Key: fn,
      StorageClass: 'STANDARD',
      Body: createReadStream(file) // 上传文件对象
    }, (err, data) => {
      err && reject(err)
      err || resolve(data)
    })
  })
}
upload()