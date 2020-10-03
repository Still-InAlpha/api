const { Router } = require('express')

const schedulePlannerRouter = require('./schedule.routes')

const router = Router()

router.use(schedulePlannerRouter)

module.exports = router
