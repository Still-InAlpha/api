const { Router } = require('express')

const schedulePlannerRouter = require('./patient.routes')

const router = Router()

router.use(schedulePlannerRouter)

module.exports = router
