const { Router } = require('express')
const { Quiz } = require('../quiz/quiz.model')
const router = new Router()

//ADD/APPLY TEAM TO QUIZ
router.post('/quizzes/:quizId/teams', async (req, res, next) => {
  try {
    const { quizId } = req.params
    const { name } = req.body

    const quiz = await Quiz.findById(quizId).exec()
    if (!quiz) return res.status(404).send({error:'Quiz not found'})

    if(quiz.status !== 'NOT_STARTED') return res.status(403).json({error:'Applications closed!'})
    
    const team = await quiz.addTeam(name)
    if (!team) return res.status(500).json({error:'Team not created!'})

    // Send ws message to quizmaster
    req.io.to(quizId).emit('NEW_JOIN_REQUEST', team.id, team.name)

    return res.status(201).json({
      quizId: quiz.id,
      teamId: team.id,
      teamName: team.name,
      approved: team.approved,
    })
  } catch (err) {
    if (err.errors && err.errors.teams) {
      console.log(err)
      return res.status(403).json({error:'Maximum teams enrolled!'})
    }
    if (err.code === 11000) {
      console.log(err)
      return res.status(403).json({error:'Team name already chosen!'})
    }

    return next(err)
  }
})

//APPROVE TEAM
router.put('/quizzes/:quizId/teams/:teamId', async (req, res, next) => {
  try {
    const { teamId, quizId } = req.params
    const { approved } = req.body
 
    const quiz = await Quiz.findById(quizId, { teams: true }).exec()
    if (!quiz) return res.status(404).json({error:'Quiz not found!'})

    const team = quiz.teams.id(teamId)
    
    if (!team)   return res.status(404).json({error:'Team not found!'})

    const _team = await team.setTeamApproval(approved)

    // Send ws message to all clients
    req.io.to(quizId).emit('JOIN_REQUEST_EVALUATED', teamId, approval)

    return res.json(_team) // TODO: Welke info is nodig?
  } catch (err) {
    return next(err)
  }
})

//GET ALL TEAMS IN QUIZ
router.get('/quizzes/:quizId/teams', async (req, res, next) => {
  try {
    const { quizId } = req.params

    const quiz = await Quiz.findById(quizId, { teams: true }).exec()
    if (!quiz) return res.status(404).json({error:'Quiz not found!'})
    return res.json(quiz.teams) // TODO: Welke info is nodig?
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  teamRouter: router,
}
