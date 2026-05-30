const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const transcriptionRoutes = require('./routes/transcriptionRoutes')

dotenv.config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// Connect DB before every request
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use('/api/transcriptions', transcriptionRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`)
})

module.exports = app