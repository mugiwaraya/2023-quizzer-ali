require('dotenv').config()
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors')
const { Server } = require('socket.io') // Import Server from socket.io

const { answerRouter } = require('./domain/answer/answer.controller')
const { authRouter } = require('./domain/auth/auth.controller')
const { categoryRouter } = require('./domain/category/category.controller')
const { questionRouter } = require('./domain/question/question.controller')
const { quizRouter } = require('./domain/quiz/quiz.controller')
const { teamRouter } = require('./domain/team/team.controller')

const expressApp = express()
const httpServer = http.createServer(expressApp)
const ioServer = new Server(httpServer, { cors: { origin: '*' } })

// EXPRESS CODE
expressApp.options('*', cors({ origin: true, credentials: true }))

// Middleware
expressApp.use(cors({ origin: true, credentials: true }))
expressApp.use(express.json())
expressApp.use((req, res, next) => {
  console.log('[REST]', req.url)
  next()
})
expressApp.use((req, res, next) => {
  req.io = ioServer
  next()
})

// Static test clients
expressApp.use('/client', express.static('./public/clients'))

// Routes
expressApp.use('/v1', answerRouter)
expressApp.use('/v1', categoryRouter)
expressApp.use('/v1', questionRouter)
expressApp.use('/v1', quizRouter)
expressApp.use('/v1', teamRouter)
expressApp.use('/', authRouter)

// Custom error handler
expressApp.use((err, req, res, next) => {
  console.log(err)
  if (err.code === 11000) return res.status(403).send() // Duplicate key error
  if (!err.message) return res.status(err.code || 500).send({ error: 'Oeps, er ging iets mis!' })
  return res.status(err.code || 500).send({ error: err.message })
})


const io = require('./websocket/events.js');

io.attach(httpServer);

// Start server & connect to db
const dbUrl = process.env.MONGO_URI;

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`)

  // MongoDB connection options
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Connect to MongoDB using dbUrl
  mongoose.set('strictQuery', false);
  mongoose.connect(dbUrl, mongooseOptions)
      .then(() => {
        console.log('Connected to MongoDB Atlas');
      })
      .catch((err) => {
        console.error(`MongoDB Atlas connection error: ${err}`);
      });

  // Gracefully close the MongoDB connection on application termination
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB Atlas connection closed');
      process.exit(0);
    });
  });
});