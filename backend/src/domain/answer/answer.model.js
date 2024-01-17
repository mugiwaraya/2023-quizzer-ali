const { Schema, model } = require('mongoose')

const answerSchema = new Schema({
  answer: {
    type: String,
  },
  correct: {
    type: Boolean,
    default: false,
  },
})

const Answer = model('Answer', answerSchema)
module.exports = {
  answerSchema,
  Answer,
}