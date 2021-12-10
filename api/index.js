import { env } from './src/config/default.js'
import { app } from './src/app/index.js'
const APP_PORT = env.app_port

app.listen(APP_PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${APP_PORT}/ ...`)
})