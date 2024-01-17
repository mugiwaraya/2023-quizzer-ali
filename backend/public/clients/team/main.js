const socket = io()

socket.on('connect', () => {
  console.log('[TEAM] Connection with server established!')
})

socket.on('disconnect', () => {
  console.log('[TEAM] Disconnected from server')
})

socket.on('connect_error', (error) => {
  console.log('[TEAM] Error connecting to server!', error)
  setTimeout(() => {
    console.log('[TEAM] Trying to reconnect...')
    socket.connect()
  }, 5000)
})

socket.io.on('error', (error) => {
  console.log('[TEAM] Error:', error)
})

socket.on('TEST', () => {
  console.log('TEST MESSAGE')
})
