const express = require('express')
const fs = require('fs')
const path = require('path')
const { slowDown } = require('express-slow-down')

const app = express.Router()

const limiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: (hits) => hits * 100
})

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

app.get('/list', limiter, (req, res) => {
  readJSONFiles(path.join(__dirname, '../repos'), (list) => { res.send(list) })
})

module.exports = app
