const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI

    if (!uri) {
      console.error('MONGO_URI is undefined! Check environment variables.')
      process.exit(1)
    }

    console.log('Connecting to MongoDB with URI:', uri.substring(0, 20) + '...')
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB Connected: ${conn.connection.host} ✅`)
  } catch (error) {
    console.error(`MongoDB Error: ${error.message} ❌`)
    process.exit(1)
  }
}

module.exports = connectDB