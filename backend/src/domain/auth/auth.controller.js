const { Router } = require('express')
const router = new Router()

router.post('/login', async (req, res, next) => {
  if (req.body.password !== 'password') return res.status(401)
  console.log(`Updating session for user ${req.body.userName}`)
  req.session.username = req.body.userName
  res.send({ result: 'OK', message: 'Session updated' })
})

router.delete('/logout', async (req, res, next) => {
  console.log('Clearing out session for', req.session.username)

  delete req.session.username
  res.send({ result: 'OK', message: 'Session cleared' })
})

module.exports = {
  authRouter: router,
}
