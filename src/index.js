const pkg = require('../package.json')

const Logger = require('@ptkdev/logger')
const express = require('express')
const { createBareServer } = require('@tomphttp/bare-server-node')
const { createServer } = require('http')
const cors = require('cors')

const logger = new Logger()
const bare = createBareServer('/bare/')
const server = createServer()
const app = express()

app.use(cors())
app.enable('trust proxy')

app.use('/apps', require('./apps'))

console.clear()
logger.info(`Starting FlowServer v${pkg.version}...`)
console.log()

server.on('request', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  res.setHeader('Access-Control-Max-Age', 2592000)
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  res.setHeader('X-Proxy-Backend', 'FlowServer')

  if (req.url.includes('bare/v2') || req.url.includes('bare/v3')) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
      code: 401,
      message: 'This request has been blocked.'
    }))
    res.end()

    logger.debug(`${req.headers['x-forwarded-for'] || req.socket.remoteAddress} - ${req.method} "${req.url}" HTTP/${req.httpVersion} ${res.statusCode} ${req.socket.bytesRead}`)

    return
  }

  logger.debug(`${req.headers['x-forwarded-for'] || req.socket.remoteAddress} - ${req.method} "${req.url}" HTTP/${req.httpVersion} ${res.statusCode} ${req.socket.bytesRead}`)

  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res)
  } else {
    app(req, res)
  }
})

server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head)
  } else {
    socket.end()
  }
})

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send({
    version: pkg.version
  })
})

function shutdown () {
  server.close()
  bare.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.listen({
  port: PORT
}, undefined, () => {
  logger.info(`FlowServer is listening at port ${PORT} (http://localhost:${PORT})`)
})
