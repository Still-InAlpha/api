const { Router } = require('express')

const ScheduleController = require('../controllers/schedule.controllers')
const schedulePlannerRouter = Router()

const scheduleController = new ScheduleController()

schedulePlannerRouter.post('/schedule_planner', (req, res) => {
  const body = req.body
  console.log(body)

  
  
  


  // TODO insert values from Rocha's scripts
  res.json(
    {
      // exercise_time: datetime,
      // exercise_type: string,
      // exercise_duration: int,
      // eating_times: datetime[],
      // macronutrients: float[][],
      // light_stimuli: float[][],
      // medication_times:
      // {
      //   medication: int
      // }
      test: 'hi'
    }
  )
})


module.exports = schedulePlannerRouter
