import { tmpdir } from 'os'
import { resolve } from 'path'
import puppeteer from 'puppeteer'

export async function getDetail() {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1000, height: 900 })
    await page.goto('http://summary.jrj.com.cn/dpyt/')
    await page.addStyleTag({
      content: `
      body > :not(.main),
        .stock_inf,
        .jrj-where,
        .scgl_s1,
        .map_bt,
        .main > .mt,
        iframe {
          display: none !important;
        }
        .main,
        .chart {
          margin: 0 !important;
        }
      `
    })
    await page.waitForSelector('.chart')
    const chart = await page.$('.chart')
    const screenshot = resolve(tmpdir(), 'go-cqhttp-node-dapan.png')
    await chart.screenshot({ path: screenshot })
    return [
      {
        type: 'image',
        data: {
          file: 'https://www.sequelize.com.cn/img/brand_logo.png'
        }
      }
    ]
    
  } catch (error) {
    console.error('[dapan]', error)
    return [
      {
        type: 'text',
        data: {
          text: error.message || '未知错误',
        },
      },
    ]
    
  } finally {
    if (browser && process.env.NODE_ENV === 'production') {
      await browser.close()
    }
  }
}