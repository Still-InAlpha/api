const { Router } = require('express')

const demoRouter = Router()

demoRouter.get('/', (req, res) => {
  res.json({ message: 'oi' })
})

module.exports = demoRouter
