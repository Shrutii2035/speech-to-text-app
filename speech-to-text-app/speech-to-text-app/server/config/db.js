const mongoose = require('mongoose')

let isConnected = false

const connectDB = async () => {
  if (isConnected) return

  try {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not defined')

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })

    isConnected = true
    console.log('MongoDB Connected ✅')
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`)
    // Don't call process.exit(1) in serverless!
  }
}

module.exports = connectDB