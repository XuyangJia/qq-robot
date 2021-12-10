import { start } from './api/index.js'

async function test() {
  const res = await start()
  console.log(res);
}