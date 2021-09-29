import { getCode } from './service.js'
async function addWatch(user_id, keyword) {
  const { code, name } = await getCode(keyword)
  if (code) {}
}


export async function manageWatch(user_id, operator, code) {}