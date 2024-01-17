const socket = io('/scoreboard')

socket.on('connect', () => {
  console.log('[SCOREBOARD] Connection open!')
})

socket.on('test', () => {
  console.log('Received test message!')

  console.log('fetching data...')
  axios
    .get('http://localhost:3000/scoreboard')
    .then((response) => response.data)
    .then((data) => console.log(data))
    .catch((err) => console.log(err))
})

socket.on('connect_error', () => {
  console.log('[SCOREBOARD] Error connecting to server!')
  setTimeout(() => {
    console.log('[SCOREBOARD] Trying to reconnect...')
    socket.connect()
  }, 5000)
})

socket.on('disconnect', (reason) => {
  console.log('[SCOREBOARD] Disconnected from server:', reason)
})
