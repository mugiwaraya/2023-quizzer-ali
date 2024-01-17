const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')
const { questionSchema, Question, usedQuestionSchema } = require('../question/question.model')
const { teamSchema, Team } = require('../team/team.model')

const quizSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(6),
  },
  teams: {
    type: [teamSchema],
    default: [],
    validate: [
      // TODO: Check dit!
      (val) => {
        const test = val.filter((el) => el.approved)
        return test.length <= 6
      },
      '{PATH} exceeds the limit of 6.',
    ],
  },
  status: {
    type: String,
    default: 'NOT_STARTED',
  },
  roundNr: {
    type: Number,
    default: 1,
  },
  categories: {
    type: [String],
    validate: [(val) => val.length <= 3, '{PATH} exceeds the limit of 3.'],
  },
  currentQuestion: {
    type: questionSchema,
    default: null,
  },
  usedQuestions: {
    type: [usedQuestionSchema],
    ref: 'Question',
    default: [],
  },
})

quizSchema.methods.addTeam = async function (teamName) {
  if (this.teams.some((team) => team.name === teamName)) {
    const error = new Error('Team name already used.')
    error.code = 11000 // Mongo duplicate key error
    throw error
  }

  const team = new Team({
    name: teamName,
  })

  this.teams.push(team)

  await this.save()

  return team
}

quizSchema.methods.setApproval = async function (teamId, approval) {
  const team = this.teams.id(teamId)
  if (!team) throw new Error('Team does not exists!')

  team.approved = approval

  this.save()

  return [{ id: team._id, approved: team.approved }]
}

quizSchema.methods.setCategories = async function (categories) {
  this.categories = categories

  this.save()

  return this.categories
}

quizSchema.methods.chooseQuestion = async function (questionId) {

  if (this.status === 'NEW_QUESTION') throw new Error('Previous question not ended yet!')

  const question = await Question.findById(questionId).exec()
  if (!question) throw new Error('Question not found')

  const alreadyUsed = (await this.usedQuestions.id(question._id)) !== null
  if (alreadyUsed) throw new Error('Question is already used.')

  if (this.status === 'ROUND_FINISHED') this.roundNr++

  this.status = 'NEW_QUESTION'
  this.currentQuestion = question

  await this.save()

  return { started: true }
}

quizSchema.methods.closeQuestion = async function () {
  if (this.status !== 'NEW_QUESTION') throw new Error('No question chosen!')

  this.status = 'QUESTION_CLOSED'
  this.usedQuestions.push(this.currentQuestion._id)
  this.currentQuestion = null

  const savedQuiz = await this.save()

  return savedQuiz
}

quizSchema.methods.endRound = async function () {
  if (this.status !== 'QUESTION_CLOSED') throw new Error('Question not closed!')

  this.status = 'ROUND_FINISHED'

  const savedQuiz = await this.save()

  return savedQuiz
}

quizSchema.methods.endQuiz = async function () {
  if (this.status !== 'ROUND_FINISHED') throw new Error('Round not ended yet!')

  this.status = 'QUIZ_FINISHED'

  const savedQuiz = await this.save()

  return savedQuiz
}

quizSchema.methods.calculatePoints = async function () {
  const teamsWithHighestToLowestPoints = this.teams.sort(
    (teamA, teamB) =>
      parseFloat(teamB.scores.correctAnswers) -
      parseFloat(teamA.scores.correctAnswers)
  )

  teamsWithHighestToLowestPoints[0].scores.roundPoints += 4
  teamsWithHighestToLowestPoints[1].scores.roundPoints += 2
  teamsWithHighestToLowestPoints[2].scores.roundPoints += 1
  console.log(teamsWithHighestToLowestPoints)
}

const Quiz = model('Quiz', quizSchema)

module.exports = {
  quizSchema,
  Quiz,
}
