var dbConn = require('../../config/db.config')

var Patient = function (patient) {
  this.name = patient.name
  this.age = patient.age
  this.workStart = patient.workStart
  this.workEnd = patient.workEnd
  this.sleepStart = patient.sleepStart
  this.sleepEnd = patient.sleepEnd
  this.sleepIntend = patient.sleepIntend
  this.createdAt = new Date()
  this.updatedAt = new Date()
}

Patient.findById = function (id, result) {
  dbConn.query('SELECT * FROM patients WHERE id = ? ', id, function (err, res) {
    if (err) {
      console.log('error: ', err)
      result(err, null)
    } else {
      result(null, res)
    }
  })
}

Patient.create = function (newPat, result) {
  dbConn.query('INSERT INTO patients set ?', newPat, function (err, res) {
    if (err) {
      console.log('error: ', err)
      result(err, null)
    } else {
      console.log(res.insertId)
      result(null, res.insertId)
    }
  })
}
module.exports = Patient
