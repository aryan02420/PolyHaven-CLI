import path from 'node:path'
import inquirer from 'inquirer'
import numeral from 'numeral'
import AdmZip from 'adm-zip'
import ora from 'ora'
import * as fetchApi from './fetch.js'
import * as guards from './guards.js'

console.clear()

const asset_type_list: assetTypesRes = await fetchApi.json(`https://api.polyhaven.com/types`)

const { type: asset_type } = await inquirer.prompt({
  type: 'list',
  name: 'type',
  choices: asset_type_list,
})

const category_list: categoryListRes = await fetchApi.json(`https://api.polyhaven.com/categories/${asset_type}`)

const { category: category_list_choice }: { category: string[] } = await inquirer.prompt({
  type: 'checkbox',
  name: 'category',
  choices: Object.entries(category_list).map(([key, val]) => ({
    name: `${key} [${numeral(val).format('0.[0]a')}]`,
    value: key,
    data: val,
  })),
})

const asset_list: unknownAsset = await fetchApi.json(
  `https://api.polyhaven.com/assets?t=${asset_type}&c=${category_list_choice.join(',')}`
)

const { asset: asset_list_choice }: { asset: string[] } = await inquirer.prompt({
  type: 'checkbox',
  name: 'asset',
  choices: Object.entries(asset_list).map(([key, val]) => ({
    name: `${key} [⇩ ${numeral(val.download_count).format('0.0a')}]`,
    value: key,
    data: val,
  })),
})

let to_download: Record<string, string> = {}
for (const asset_name of asset_list_choice) {
  console.log(asset_name)
  const asset_info = asset_list[asset_name]
  let file_list: unknownFile = await fetchApi.json(`https://api.polyhaven.com/files/${asset_name}`)
  console.log(asset_name)
  if (guards.isHdriFile(file_list)) {
    const urls = await findUrls(file_list.hdri, asset_name)
    to_download = { ...to_download, ...urls }
  } else if (guards.isTextureFile(file_list)) {
    const urls = await findUrls(file_list, asset_name)
    to_download = { ...to_download, ...urls }
  } else if (guards.isModelFile(file_list)) {
    const urls = await findUrls(file_list, asset_name)
    to_download = { ...to_download, ...urls }
  }
}


console.clear()

const { confirm_download } = await inquirer.prompt({
  type: 'confirm',
  name: 'confirm_download',
  message: `${Object.keys(to_download).length} files will be downloaded`,
})
if (!confirm_download) process.exit(0)

const { zip_name } = await inquirer.prompt({
  type: 'input',
  name: 'zip_name',
  message: 'File Name (*.zip)',
})

const zip = new AdmZip()
for (const file in to_download) {
  const spinner = ora(`Downloading ${file}`).start()
  const data = await fetchApi.binary(to_download[file])
  spinner.succeed()
  zip.addFile(file, data)
}

const zip_name_final = `downloads/${zip_name || Date.now()}.zip`
const spinner = ora(`Saving ${zip_name_final}`).start()
zip.toBuffer()
zip.writeZip(zip_name_final)
spinner.succeed()

async function findUrls(nestedFile: any, message?: string): Promise<Record<string, string>> {
  let urls: Record<string, string> = {}
  if (guards.isFileUrlwithInclude(nestedFile)) {
    const filename = path.basename(nestedFile.url)
    const include = Object.entries(nestedFile.include).map(([path, fileurl]) => [path, fileurl.url])
    const include_urls = Object.fromEntries(include) as typeof urls
    urls = {
      ...urls,
      [filename]: nestedFile.url,
      ...include_urls,
    }
  } else if (guards.isFileUrl(nestedFile)) {
    const filename = path.basename(nestedFile.url)
    urls = {
      ...urls,
      [filename]: nestedFile.url,
    }
  } else {
    const keys = Object.keys(nestedFile)
    console.clear()
    const { key: keys_choice }: { key: string[] } = await inquirer.prompt({
      type: 'checkbox',
      name: 'key',
      message,
      choices: ['SKIP', ...keys],
      validate: async (input: string[]) => {
        return input.length > 0
      },
    })
    while (keys_choice.length) {
      const key = keys_choice.pop()
      if (key === undefined) break
      if (key === 'SKIP') continue
      urls = {
        ...urls,
        ...(await findUrls(nestedFile[key], `${message}.${key}`)),
      }
    }
  }
  return urls
}
