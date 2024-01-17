# Quizzer REST API • Documentatie

- [Quizzer REST API • Documentatie](#quizzer-rest-api--documentatie)
  - [Categories](#categories)
  - [Questions](#questions)
  - [Quizzes](#quizzes)
  - [Teams](#teams)
  - [Answers](#answers)
  - [Scores](#scores)

## Categories

> **`GET`** `/questions/categories`

> NOTE: Because the categories are hard coded strings in each question, an array with all unique category names will be returned. Maybe we should change this to a seperate category model?

***Get a list of all question categories***

_parameters_

none

_returns_

```json
[ String ]
```

---

## Questions
> **`GET`** `/questions`

> **NOTE:** Deze hebben we niet nodig (denk ik)

***Get a list of all questions***

_parameters_

none

_returns_

```json
[
    {
      "id": Number,
      "question": String,
      "answer": String,
      "category": String
    },
]
```

---

> **`GET`** `/questions/:questionId`

***Get a single question based on id***

_parameters_

`questionId` - the id of the question to get.

_returns_

```json
{
  "id": Number,
  "question": String,
  "answer": String,
  "category": String
}
```

---

> **`GET`** `/questions/category/:categoryName/questions`

> NOTE: Check note on [categories](#categories).

***Get a list of all questions in given category***

_parameters_

`categoryName` - The name of the category.

_returns_

```json
[
    {
      "id": Number,
      "question": String,
      "answer": String,
      "category": String
    },
]
```

---

## Quizzes

> **`GET`** `/quizzes/:quizId`

***Get a quiz with id***

_parameters_

`quizId` - the id of the quiz to fetch

_returns_

```json
{
  "quizId": String,
}
```

---

> **`POST`** `/quizzes/`

**Create a new quiz**

_parameters_

`quizId` - the id of the create quiz -- ToDo - deze wellicht niet nodig, want wordt door backend gegenereerd

`session_id` - the session-id of the quizmaster -- ToDo - deze wellicht wel nodig, want de backend moet weten wie rechten heeft tot bepaalde acties.


_returns_

```json
{
  "quizId": String,
}
```

---
> **`POST`** `/quizzes/:quizId/questions/current`

**Start new question**

The quizmaster will send this request when a round/question needs to be started.

_parameters_

`quizId` - the id of the quiz


_body_

```json
{
  "questionId": String
}

```

_returns_

```json
{
  "started": Boolean,
}
```

---

> **`PUT`** `/quizzes/:quizId/questions/current`

**End current question**

The quizmaster will send this request when the question needs to be closed. The server will push the current question to the usedQuestions array and empty currentQuestion.

_parameters_

`quizId` - the id of the quiz

_returns_

```json
{
  "closed": Boolean,
}
```

---

## Teams

> **`GET`** `/quizzes/:quizId/teams`

Get all participating teams of the concerning quiz

_parameters_

`quizId` - id of the quiz.

_returns_

```json
[{
  "id": String,
  "name": String,
},
...]
```
---
> **`POST`** `/quizzes/:quizId/teams`

Create new team resource in an existing quiz.

_parameters_

`quizId` - id of the quiz.

_body_

```json
{
  "name": String
}
```

_returns_

```json
{
  "id": String,
  "name": String,
  "approved": Boolean,
}
```
---

> **`PUT`** `/quizzes/:quizId/teams/:teamId`

Approve or disapprove a teamapplication (by quizmaster client)

_parameters_

`quizId` - id of the quiz.
`teamid` - id of the team to be approved

_body_

```json
{
  "approved": Boolean,
}

```

_returns_

```json
{
  "id": String,
  "approved": Boolean,
}
```

## Answers

> **`POST`** `/quizzes/:quizId/teams/:teamId/answers/current`

Create a new answer resource for a team.

_parameters_

`quizId` - id of the quiz.  
`teamId` - id of the team.

_body_

```json
{
  "questionId": String,
  "answer": String,
}
```

_returns_

```json
{
  "id": String,
  "questionId": String,
  "answer": String,
}
```

---

> **`PUT`** `/quizzes/:quizId/teams/:teamId/answers/current`

***Approve an answer of a team***

_parameters_

`quizId` - id of the quiz.  
`teamId` - id of the team.

_body_

```json
{
  "approved": Boolean,
}
```

_returns_

```json
{
  "answer": String,
  "correct": Boolean,
  "_id": String,
}
```

---

> **`GET`** `/quizzes/:quizId/teams/:teamId/answers/current`

Get the current answer of a team.

_parameters_

`quizId` - id of the quiz.  
`teamId` - id of the team.

_body_

none

_returns_

```json
{
  "id": String,
  "questionId": String,
  "answer": String,
}
```

---

## Scores

> **`GET`** `/quizzes/:quizId/teams/scores`

Gets scores of all teams of a certain quiz.

_parameters_

`quizId` - id of the quiz.

_body_

none

_returns_

```json
[
  {
    "teamId:" String
    "scores": [{
      "roundPoints": Number,
      "correctAnswers": Number,
    }]
  }
]
```

---