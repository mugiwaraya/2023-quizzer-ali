const { Router } = require('express')
const { Question } = require('../question/question.model')
const router = new Router()

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Question.find({}, 'category').distinct('category').exec()
    if (!categories || categories.length <= 0) return res.status(404).send('No categories found!')

    return res.json(categories)
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  categoryRouter: router,
}
