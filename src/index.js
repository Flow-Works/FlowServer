const pkg = require('../package.json')

const Logger = require('@ptkdev/logger')
const express = require('express')
const { createBareServer } = require('@tomphttp/bare-server-node')
const { createServer } = require('http')
const csrf = require('csurf')

const logger = new Logger()
const bare = createBareServer('/bare/')
const server = createServer()
const app = express()

app.use(csrf())

app.disable('x-powered-by')

console.clear()
logger.info(`Starting FlowServer v${pkg.version}...`)
console.log()

server.on('request', (req, res) => {
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

app.use('/apps', require('./apps'))

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
