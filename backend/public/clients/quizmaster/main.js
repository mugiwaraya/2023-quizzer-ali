const api = 'http://localhost:5000/v1'

// 1. NEW QUIZ
const newQuizLoadingEl = document.querySelector('#newQuizLoading')
const newQuizDataEl = document.querySelector('#newQuizData')
const newQuizErrorEl = document.querySelector('#newQuizError')
const newQuizButtonEl = document.querySelector('#newQuizButton')

let currentQuiz

const newQuiz = async () => {
  newQuizLoadingEl.innerHTML = 'true'
  try {
    // Get quizId
    const response = await axios.post(api + '/quizzes')
    newQuizLoadingEl.innerHTML = 'false'
    newQuizDataEl.innerHTML = JSON.stringify(response.data)
    currentQuiz = response.data
    console.log('new quiz created', response.data)

    // Start websocket connection
    startWs()
  } catch (err) {
    newQuizLoadingEl.innerHTML = 'false'
    newQuizErrorEl.innerHTML = err.message
  }
}

newQuizButtonEl.addEventListener('click', newQuiz)
newQuiz() // TODO: REMOVE!

// 2. APPROVE REQUESTS
const approveJoinRequestLoadingEl = document.querySelector('#approveJoinRequestLoading')
const approveJoinRequestDataEl = document.querySelector('#approveJoinRequestData')
const approveJoinRequestErrorEl = document.querySelector('#approveJoinRequestError')

async function sendJoinRequest(teamId, approval) {
  approveJoinRequestLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}/teams/${teamId}`, { approval })
    approveJoinRequestDataEl.innerHTML = JSON.stringify(response.data)
    approveJoinRequestLoadingEl.innerHTML = 'false'
  } catch (error) {
    approveJoinRequestLoadingEl.innerHTML = 'false'
    approveJoinRequestErrorEl.innerHTML = error.message
  }
}

const JoinedTeamsTable = function () {
  const joinedTeamsTableEl = document.querySelector('#joinedTeamsTable')
  const arr = []

  arr.push = function () {
    const teamName = arguments[0].teamName
    const teamId = arguments[0].teamId

    // Add DOM element
    const td = document.createElement('td')
    td.innerHTML = teamName

    const td2 = document.createElement('td')
    const approveButton = document.createElement('button')
    approveButton.innerHTML = 'approve'
    approveButton.onclick = function (ev) {
      sendJoinRequest(teamId, true)
    }
    const disapproveButton = document.createElement('button')
    disapproveButton.innerHTML = 'disapprove'
    disapproveButton.onclick = function (ev) {
      sendJoinRequest(teamId, false)
    }

    td2.appendChild(approveButton)
    td2.appendChild(disapproveButton)

    const tr = document.createElement('tr')
    tr.appendChild(td)
    tr.appendChild(td2)

    joinedTeamsTableEl.appendChild(tr)

    return Array.prototype.push.apply(this, arguments)
  }

  return arr
}

const joinedTeams = new JoinedTeamsTable()

// 3. CHOOSE QUESTION CATEGORIES
const categoriesListEl = document.querySelector('#categoriesList')
const categoriesErrorEl = document.querySelector('#categoriesError')
const categoriesLoadingEl = document.querySelector('#categoriesLoading')
const submitCategoriesButtonEl = document.querySelector('#submitCategoriesButton')
const fetchCategoriesButtonEl = document.querySelector('#fetchCategoriesButton')

const fetchCategories = async () => {
  categoriesListEl.innerHTML = null
  categoriesLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.get(api + '/categories')
    response.data.forEach((el) => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.name = el
      checkbox.value = el
      checkbox.id = el
      checkbox.className = 'category-checkbox'
      const label = document.createElement('label')
      label.htmlFor = el
      label.innerHTML = el
      label.appendChild(checkbox)
      categoriesListEl.appendChild(label)
      categoriesLoadingEl.innerHTML = 'false'
    })

    submitCategoriesButtonEl.style.display = 'block'
  } catch (error) {
    categoriesErrorEl.innerHTML = error.message
    categoriesLoadingEl.innerHTML = 'false'
  }
}
fetchCategories()

let selectedCategories = []
submitCategoriesButtonEl.addEventListener('click', async () => {
  selectedCategories = []

  document.querySelectorAll('.category-checkbox').forEach((el) => {
    if (el.checked) selectedCategories.push(el.value)
  })

  if (selectedCategories.length !== 3) return alert('Need to select 3 categories')

  categoriesLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}/categories`, { categories: selectedCategories })

    categoriesErrorEl.innerHTML = ''
    categoriesLoadingEl.innerHTML = 'false'
    alert('submitted!')
  } catch (error) {
    categoriesErrorEl.innerHTML = error.message
    categoriesLoadingEl.innerHTML = 'false'
  }
})

// 4. SELECT QUESTION
const questionsLoadingEl = document.querySelector('#questionsLoading')
const questionsDataEl = document.querySelector('#questionsData')
const questionsErrorEl = document.querySelector('#questionsError')
const fetchQuestionsButtonEl = document.querySelector('#fetchQuestionsButton')
const submitQuestionButtonEl = document.querySelector('#submitQuestionButton')
let selectedQuestionId

questionsDataEl.addEventListener('change', (e) => {
  selectedQuestionId = e.target.value
})

fetchQuestionsButtonEl.addEventListener('click', async () => {
  selectedCategories = ['Music', 'Sport', 'Film and TV'] // TODO: Remove! Debug only!
  if (!selectedCategories || selectedCategories.length !== 3) return alert('No categories selected!')

  questionsLoadingEl.innerHTML = 'true'
  try {
    const questions = []

    selectedCategories.forEach((category) =>
      questions.push(axios.get(api + `/questions/category/${category}?page=1&limit=10`))
    )

    const result = await Promise.all(questions)

    result.forEach((response) => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = response.data[0].category

      response.data.forEach((question) => {
        const option = document.createElement('option')
        option.innerHTML = question.question
        option.value = question.questionId
        optgroup.appendChild(option)
      })

      questionsDataEl.appendChild(optgroup)
    })

    submitQuestionButtonEl.style.display = 'block'
    questionsErrorEl.innerHTML = ''
    questionsLoadingEl.innerHTML = 'false'
  } catch (error) {
    questionsErrorEl.innerHTML = error.message
    questionsLoadingEl.innerHTML = 'false'
  }
})

submitQuestionButtonEl.addEventListener('click', async () => {
  if (!currentQuiz?.id) return (questionsErrorEl.innerHTML = 'No quizId!')
  if (!selectedQuestionId) return (questionsErrorEl.innerHTML = 'No selected question!')

  questionsLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}/questions/current`, {
      questionId: selectedQuestionId,
    })

    const response2 = await axios.get(api + `/questions/${selectedQuestionId}`)
    correctAnswerEl.innerHTML = response2.data.answer

    alert('submitted!')
    questionsErrorEl.innerHTML = ''
    questionsLoadingEl.innerHTML = 'false'
  } catch (error) {
    questionsErrorEl.innerHTML = error.message
    questionsLoadingEl.innerHTML = 'false'
  }
})

// 5. ASSESS ANSWERS
const answersLoadingEl = document.querySelector('#answersLoading')
const answersErrorEl = document.querySelector('#answersError')
const correctAnswerEl = document.querySelector('#correctAnswer')
const closeQuestionButtonEl = document.querySelector('#closeQuestionButton')

closeQuestionButtonEl.addEventListener('click', async () => {
  answersLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}`, { status: 'QUESTION_CLOSED' })

    answersLoadingEl.innerHTML = 'false'
  } catch (error) {
    answersErrorEl.innerHTML = error.message
    answersLoadingEl.innerHTML = 'false'
  }
})

async function approveAnswer(quizId, teamId, approval) {
  answersLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${quizId}/teams/${teamId}/answer`, { approval: approval })
    alert(`answer ${approval}`)
    answersLoadingEl.innerHTML = 'false'
  } catch (err) {
    answersErrorEl.innerHTML = err.message
    answersLoadingEl.innerHTML = 'false'
  }
}

const AnswersTable = function () {
  const answersTableEl = document.querySelector('#answersTable')
  const arr = []

  arr.push = function () {
    const teamId = arguments[0].teamId
    const answer = arguments[0].answer

    // Add DOM element
    const td = document.createElement('td')
    td.innerHTML = teamId

    const td2 = document.createElement('td')
    td2.innerHTML = answer

    const approveButton = document.createElement('button')
    approveButton.innerHTML = 'approve'
    approveButton.onclick = function (ev) {
      approveAnswer(currentQuiz.id, teamId, true)
    }
    const disapproveButton = document.createElement('button')
    disapproveButton.innerHTML = 'disapprove'
    disapproveButton.onclick = function (ev) {
      approveAnswer(currentQuiz.id, teamId, false)
    }

    const td3 = document.createElement('td')
    td3.appendChild(approveButton)
    td3.appendChild(disapproveButton)

    const tr = document.createElement('tr')
    tr.appendChild(td)
    tr.appendChild(td2)
    tr.appendChild(td3)

    answersTableEl.appendChild(tr)

    return Array.prototype.push.apply(this, arguments)
  }

  return arr
}

const answers = new AnswersTable()

// 6. ROUND
const endRoundLoadingEl = document.querySelector('#endRoundLoading')
const endRoundDataEl = document.querySelector('#endRoundData')
const endRoundErrorEl = document.querySelector('#endRoundError')
const endRoundButtonEl = document.querySelector('#endRoundButton')
endRoundButtonEl.addEventListener('click', async () => {
  endRoundLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}`, { status: 'ROUND_FINISHED' })

    endRoundDataEl.innerHTML = JSON.stringify(response.data)
    endRoundLoadingEl.innerHTML = 'false'
    endRoundErrorEl.innerHTML = ''
  } catch (error) {
    endRoundErrorEl.innerHTML = error.message
    endRoundLoadingEl.innerHTML = 'false'
  }
})

// 7. QUIZ
const endQuizLoadingEl = document.querySelector('#endQuizLoading')
const endQuizDataEl = document.querySelector('#endQuizData')
const endQuizErrorEl = document.querySelector('#endQuizError')
const endQuizButtonEl = document.querySelector('#endQuizButton')
endQuizButtonEl.addEventListener('click', async () => {
  endQuizLoadingEl.innerHTML = 'true'
  try {
    const response = await axios.put(api + `/quizzes/${currentQuiz.id}`, { status: 'QUIZ_FINISHED' })

    endQuizDataEl.innerHTML = JSON.stringify(response.data)
    endQuizLoadingEl.innerHTML = 'false'
    endQuizErrorEl.innerHTML = ''
  } catch (error) {
    endQuizErrorEl.innerHTML = error.message
    endQuizLoadingEl.innerHTML = 'false'
  }
})

// WEBSOCKET
var WsMessagesList = function () {
  const wsMessagesEl = document.querySelector('#wsMessages')
  const arr = []

  arr.push = function () {
    const message = arguments[0]
    console.log(`[IO] ${message}`)

    // Add DOM element
    const li = document.createElement('li')
    li.innerHTML = message
    wsMessagesEl.appendChild(li)

    return Array.prototype.push.apply(this, arguments)
  }

  return arr
}
const wsMessages = new WsMessagesList()

let socket

const startWs = () => {
  if (!currentQuiz?.id) {
    return alert('No Quiz Id!')
  }

  wsMessages.push('connecting...')
  socket = io()

  socket.on('connect', () => {
    wsMessages.push('connected')

    wsMessages.push(`joining room ${currentQuiz.id}...`)
    socket.emit('JOIN_ROOM', currentQuiz.id, 'quizmaster', 'quizmaster')
  })

  socket.on('disconnect', () => {
    wsMessages.push('Disconnected from server')
  })

  socket.on('connect_error', () => {
    wsMessages.push('Error connecting to server!')

    setTimeout(() => {
      wsMessages.push('Trying to reconnect...')
      socket.connect()
    }, 5000)
  })

  socket.on('JOIN_ROOM', (quizId) => {
    wsMessages.push(`joined room ${currentQuiz.id}`)
  })

  socket.on('NEW_JOIN_REQUEST', (teamId, teamName) => {
    wsMessages.push(`new join request: ${teamId} ${teamName}`)
    joinedTeams.push({ teamId, teamName })
  })

  socket.on('NEW_ANSWER', (teamId, answer) => {
    wsMessages.push(`${teamId} submitted an answer: ${answer}`)
    answers.push({ teamId, answer })
  })
}
