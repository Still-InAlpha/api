const { Router } = require('express')
const Patient = require('../models/patient.model')
// const ScheduleController = require('../controllers/schedule.controllers')
const schedulePlannerRouter = Router()

// const scheduleController = new ScheduleController()

schedulePlannerRouter.get('/schedule_planner/:id', (req, res) => {
  console.log(req.params.id)
  Patient.findById(req.params.id, function (err, patient) {
    if (err) { res.send(err) }
    res.json(patient)
  })
})

schedulePlannerRouter.post('/schedule_planner', (req, res) => {
  const newPatient = new Patient(req.body)

  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: 'Please provide all required field' })
  } else {
    Patient.create(newPatient, function (err, patient) {
      if (err) { res.send(err) }
      res.json({ error: false, message: 'Patient added successfully!', data: patient })
    })
  }
  console.log(newPatient)

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
