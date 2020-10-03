const express = require('express')
const cors = require('cors')
const app = express()

const router = require('./routes')

app.use(express.json())
app.use(cors())

app.use(router)

app.listen(3333, () => {
  console.log('Server Started')
})
