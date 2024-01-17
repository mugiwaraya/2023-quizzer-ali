const { Schema, model } = require('mongoose')
const { answerSchema, Answer } = require('../answer/answer.model')

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  scores: {
    type: [
      {
        roundPoints: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
      },
    ],
  },
  answer: {
    type: answerSchema,
    default: null,
  },
})

teamSchema.methods.setAnswer = async function (_answer) {
  this.answer = new Answer({ answer: _answer })
  await this.parent().save()

  return this.answer
}

teamSchema.methods.setTeamApproval = async function (approval) {
  this.approved = approval
  this.parent().save()
  console.log(this.scores.correctAnswers)

  return this
}

teamSchema.methods.approveAnswer = async function (approval) {
  this.answer.correct = approval

  await this.parent().save()

  return this.answer

  // TODO: Calculate score!
  if (approval) {
    this.answer.correct = approval
    if (this.scores.correctAnswers == undefined) console.log(this.scores.correctAnswers)
    this.scores.correctAnswers++
    console.log(this.scores.correctAnswers)
  }

  await this.parent().save()
  return this.answer
}

teamSchema.methods.resetCorrectAnswersCount = async function () {
  this.scores.correctAnswers = 0
}

const Team = model('Team', teamSchema)

module.exports = {
  teamSchema,
  Team,
}
