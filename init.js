const config = require('./config.json')

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')

const clearFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file)

      if (fs.lstatSync(currentPath).isDirectory()) {
        clearFolderRecursive(currentPath)
      } else {
        fs.unlinkSync(currentPath)
      }
    })

    fs.rmdirSync(folderPath)
  }
}

if (fs.existsSync(path.join(__dirname, 'repos'))) clearFolderRecursive(path.join(__dirname, 'repos'))
fs.mkdirSync(path.join(__dirname, 'repos'))

config.repos.forEach((url) => {
  fetch(url).then(res => res.json()).then(content => {
    content.id = uuid()
    fs.writeFileSync(path.join(__dirname, 'repos', content.id + '.json'), JSON.stringify(content))
  })
})
