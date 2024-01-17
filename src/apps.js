const express = require('express')
const config = require('../config.json')

const app = express.Router()

app.get('/list', (req, res) => {
  res.send(config.repos)
})

module.exports = app
