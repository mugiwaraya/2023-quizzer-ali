const { Router } = require('express')
const { Quiz } = require('./quiz.model')
const router = new Router()


//CREATE QUIZ
router.post('/quizzes', async (req, res, next) => {
  try {
    const quiz = await Quiz.create({})
    if (!quiz) throw new Error('Quiz not created!')
    
    return res.status(201).json({ id: quiz._id }) // TODO: Welke info is nodig?
  } catch (err) {
    return next(err)
  }
})

//GET QUIZ OBJECT
router.get('/quizzes/:quizId', async (req, res, next) => {
  try {
    const { quizId } = req.params

    const quiz = await Quiz.findById(quizId).exec()
    if (!quiz) return res.status(404).send('Quiz not found!')

    return res.json(quiz)
  } catch (err) {
    return next(err)
  }
})


router.put('/quizzes/:quizId/categories', async (req, res, next) => {
  try {
    const { quizId } = req.params
    const { categories } = req.body

    if (!Array.isArray(categories) || categories.length !== 3) return res.status(400).send()

    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).send('Quiz not found!')

    const _categories = await quiz.setCategories(categories)

    return res.json(_categories)
  } catch (err) {
    return next(err)
  }
})

//GET CURRENT ACTIVE QUESTION OF QUIZ
router.put('/quizzes/:quizId/questions/current', async (req, res, next) => {
  try {
    const { quizId } = req.params
    const { questionId } = req.body

    const quiz = await Quiz.findById(quizId).exec()
    if (!quiz) return res.status(404).send('Quiz not found!')

    let question

    if (typeof questionId !== 'undefined') {
      question = await quiz.chooseQuestion(questionId)
    } else {
      question = await quiz.closeQuestion()
    }

    // SEND WS MESSAGE 'NEW_QUESTION' WITH questionId
    req.io.to(quizId).emit('NEW_QUESTION', questionId)

    return res.json(question)
  } catch (err) {
    return next(err)
  }
})

router.put('/quizzes/:quizId', async (req, res, next) => {
  try {
    const { quizId } = req.params
    const { status } = req.body

    // Validation
    if (!status || !['QUESTION_CLOSED', 'ROUND_FINISHED', 'QUIZ_FINISHED'].includes(status)) return res.status(400).send()

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId).exec()
    if (!quiz) return res.status(404).send('Quiz not found!')

    // Business Logic
    let _quiz
    if (status === 'QUESTION_CLOSED') {
      _quiz = await quiz.closeQuestion()
    } else if (status === 'ROUND_FINISHED') {
      _quiz = await quiz.endRound()
    } else if (status === 'QUIZ_FINISHED') {
      _quiz = await quiz.endQuiz()
    }

    // SEND WS MESSAGE
    req.io.to(quizId).emit(status)

    return res.json({
      quizId: quiz._id,
      status: quiz.status,
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  quizRouter: router,
}
