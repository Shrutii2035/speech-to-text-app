import dotenv from 'dotenv'
dotenv.config()
console.log('OpenAI Key:', process.env.OPENAI_API_KEY)
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import transcriptionRoutes from './routes/transcriptionRoutes.js'

connectDB()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/transcriptions', transcriptionRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`)
})