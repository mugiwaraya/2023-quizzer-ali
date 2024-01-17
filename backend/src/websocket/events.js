const { Server } = require('socket.io');

const io = new Server();

// WEBSOCKET CODE
io.on('connection', (socket) => {
  const print = (message) => {
    console.log(`[IO][${socket.id}][${[...socket.rooms][1]}] ${message}`)
  }

  print('new connection')

  socket.on('JOIN_ROOM', (quizId, teamId, teamName) => {
    print(`${teamName} joined room: ${quizId}`)

    // Let socket join the quiz room
    socket.join(quizId)
    socket.emit('JOIN_ROOM', quizId) // Send confirmation message back
  })

  socket.on('APPLICATION_APPROVED', (data) => {
    print(`application approved ${data.toString()}`)
    ioServer.emit('APPLICATION_APPROVED', data)
  })

  socket.on('TEAM_JOINED', (teamName) => {
    console.log(`[IO] TEAM_JOINED `, teamName)
    ioServer.emit('TEAM_JOINED', teamName)
  })

  socket.on('NEW_QUESTION', (question) => {
    print(`new question: ${question}`)
    ioServer.emit('NEW_QUESTION', question)
  })

  socket.on('QUESTION_ANSWERED', (data) => {
    console.log(`[IO] QUESTION_ANSWERED `, data)
    ioServer.emit('QUESTION_ANSWERED', data)
  })

  socket.on('QUESTION_CLOSED', () => {
    print('question closed')
    ioServer.emit('QUESTION_CLOSED')
  })

  socket.on('JOIN_QUIZ', (quizId) => {
    const clients = ioServer.sockets.adapter.rooms.get(quizId)
    if (!clients || clients.size < 7) {
      print(`joined room: ${quizId}`)
      socket.join(quizId)
      ioServer.to(quizId).emit('TEAM_JOINED')
    } else {
      print(`cannot join room: ${quizId}`)
      socket.disconnect()
    }
  })
})

module.exports = io;