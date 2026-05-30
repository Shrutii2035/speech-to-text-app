const mongoose = require('mongoose')

mongoose.set('bufferCommands', false)

let isConnected = false

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return

  try {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not defined')

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      maxPoolSize: 10,
      bufferCommands: false,
    })

    isConnected = true
    console.log('MongoDB Connected ✅')
  } catch (error) {
    isConnected = false
    console.error(`MongoDB Error: ${error.message}`)
    throw error
  }
}

module.exports = connectDB