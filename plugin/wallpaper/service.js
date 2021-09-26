import fetch from 'node-fetch'
import { stringify } from 'qs'
import { load } from 'cheerio'

const publicPath = 'https://wallhaven.cc/search'
const options = {
  sorting: 'random',
  purity: 100,
  ratios: '16x9%2C16x10',
  categories: '001',
}

async function getHrefs() {
  const response = await fetch(`${publicPath}?${stringify(options)}`)
  const htmlData = await response.text()
  const $ = load(htmlData)
  const arr = [...$('section > ul > li > figure > a')]
  return arr.filter(a => a.attribs && a.attribs.href).map(a => a.attribs.href)
}

async function getImage() {
  const hrefs = await getHrefs()
  const response = await fetch(hrefs[0])
  const htmlData = await response.text()
  const $ = load(htmlData)
  return $('#wallpaper')[0].attribs
}

export async function getWallPaper(categories) {
  try {
    options.categories = categories
    const { src, alt } = await getImage()
    return [
      {
        type: 'text',
        data: { text: alt }
      },
      {
        type: 'image',
        data: { file: src }
      }
    ]
  } catch (e) {
    console.error('[mm]', e)
    return [
      {
        type: 'text',
        data: { text: '壁纸丢失' }
      }
    ]
  }
}