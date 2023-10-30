const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express.Router()

function readJSONFiles (folderPath, callback) {
  fs.readdir(folderPath, (err, files) => {
    if (err) throw new Error('Error reading folder:', err)

    const jsonFiles = files.filter(file => path.extname(file) === '.json')
    const jsonObjects = []

    jsonFiles.forEach(file => {
      const filePath = path.join(folderPath, file)
      try {
        const data = fs.readFileSync(filePath, 'utf8')
        const jsonObject = JSON.parse(data)
        jsonObjects.push(jsonObject)
      } catch (parseErr) {
        console.error(`Error parsing JSON in file ${file}:`, parseErr)
      }
    })

    callback(jsonObjects)
  })
}

app.get('/list', (req, res) => {
  readJSONFiles(path.join(__dirname, '../repos'), (list) => { res.send(list) })
})

module.exports = app
