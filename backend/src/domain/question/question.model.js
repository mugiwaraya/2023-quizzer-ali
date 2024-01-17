const { Schema, model } = require('mongoose')

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
})

const usedQuestionSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
  },
})

const Question = model('Question', questionSchema)

module.exports = {
  questionSchema,
  Question,
  usedQuestionSchema
}
