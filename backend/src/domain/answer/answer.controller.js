const { Router } = require('express')
const { Quiz } = require('../quiz/quiz.model')
const { Answer, answerSchema } = require('../answer/answer.model')
const router = new Router()

//POST ANSWER TO CURRENT QUESTION
router.post('/quizzes/:quizId/teams/:teamId/answer', async (req, res, next) => {
  try {
    const { quizId, teamId } = req.params
    const { answer } = req.body

    if (!answer) return res.status(400)

    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).send('Quiz not found!')

    // if (quiz.status !== 'NEW_QUESTION') return res.status(403).json('Question closed!')
//     const quiz = await Quiz.findById(quizId)
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found!' })

//     const team = await quiz.teams.id(teamId)
//     if (!team) return res.status(404).json({ error: 'Team not found!' })

//     if (quiz.status === 'NOT_STARTED') {
//       return res.status(403).json({ error: 'Quiz has not started yet!' })
//     } else if (quiz.status !== 'NEW_QUESTION')
//       return res.status(403).json({ error: 'Question closed!' })


    const _answer = await quiz.teams.id(teamId).setAnswer(answer)
    if (!_answer) return res.status(400).json({ error: 'No answer submitted!' })

    // SEND WEBSOCKET MESSAGE
    req.io.to(quizId).emit('NEW_ANSWER', teamId, answer)

    return res.json({
      answerId: _answer._id,
      answer: _answer.answer,
      correct: _answer.correct,
    })
  } catch (err) {
    return next(err)
  }
})

//GET ANSWERS FROM ALL TEAMS
router.get('/quizzes/:quizId/teams/answers', async (req, res, next) => {
  try {
    const { quizId, teamId } = req.params
    const { approved } = req.body

    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).json({ error: 'Quiz not found!' })

    const answers = await quiz.teams.map((team) => {
      return { name: team.name, answer: team.answer }
    })

    return res.status(201).json(
      answers.map((a) => ({
        answerId: a._id,
        answer: a.answer,
        correct: a.correct,
      }))
    ) // TODO: Wat te retourneren?
  } catch (err) {
    return next(err)
  }
})

//APPROVE ANSWER
router.put('/quizzes/:quizId/teams/:teamId/answer', async (req, res, next) => {
  try {
    const { quizId, teamId } = req.params
    const { approval } = req.body

    if (approval === undefined) return res.status(400).send()

    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).json({ error: 'Quiz not found!' })

    const team = await quiz.teams.id(teamId)
    if (!team) return res.status(404).json({ error: 'Team not found!' })

    const _answer = await team.approveAnswer(approval)
    if (!_answer) throw new Error('Answer approval not updated')


    return res.status(201).json({
      answerId: _answer._id,
      answer: _answer.answer,
      correct: _answer.correct,
    }) // TODO: Wat te retourneren?
  } catch (err) {
    return next(err)
  }
})

module.exports = { answerRouter: router }
