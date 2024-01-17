const { Router } = require('express')
const { Question } = require('./question.model')
const router = new Router()

router.get('/questions', async (req, res, next) => {
  try {
    const { id } = req.params

    const question = await Question.find().exec()
    if (!question) return res.status(404).send('Question not found!')

    return res.json(question)
  } catch (err) {
    return next(err)
  }
})

router.get('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const question = await Question.findById(id).exec()
    if (!question) return res.status(404).send('Question not found!')

    return res.json({
      questionId: question._id,
      question: question.question,
      category: question.category,
      answer: question.answer,
    })
  } catch (err) {
    return next(err)
  }
})

router.get('/questions/category/:categoryName', async (req, res, next) => {
  try {
    const { categoryName } = req.params
    const { page: _page, limit: _limit } = req.query

    // Pagination logic
    if ((_page && _page < 1) || (_limit && _limit < 1) || (_page && !_limit))
      return next({ code: 400, message: 'Invalid pagination parameters!' })

    const page = _page ? parseInt(_page) : undefined
    const limit = _limit ? parseInt(_limit) : undefined
    const skip = page && limit ? (page - 1) * limit : 0

    const questions = await Question.find({ category: categoryName })
      .skip(skip)
      .limit(limit)
      .exec()
    if (!questions || questions.length <= 0)
      return res.status(404).send('No questions found!')

    return res.json(
      questions.map((q) => ({
        questionId: q._id,
        question: q.question,
        category: q.category,
        answer: q.answer,
      }))
    )
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  questionRouter: router,
}
