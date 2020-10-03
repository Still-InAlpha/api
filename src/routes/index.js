const { Router } = require('express')

const demoRouter = require('./demo.routes')

const router = Router()

router.use(demoRouter)

module.exports = router
