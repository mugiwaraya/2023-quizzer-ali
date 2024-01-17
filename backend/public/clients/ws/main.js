const ws = new WebSocket('ws://localhost:3000')

ws.onopen = () => {
  console.log('Connection open!')
}

ws.onclose = () => {
  console.log('Connection closed!')
}

ws.onerror = () => {
  console.log('Connection error!')
}

ws.onmessage = (eventInfo) => {
  const msg = eventInfo.data
  console.log('New message:', msg)
}
