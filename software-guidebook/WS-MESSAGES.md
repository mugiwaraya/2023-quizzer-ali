# Quizzer WEBSOCKET MESSAGES • Documentatie

- [Quizzer WEBSOCKET MESSAGES • Documentatie](#quizzer-websocket-messages--documentatie)

> `'NEW_APPLICATION'`


## Team Management

`'team_applied'` - A team submitted an application
```json
{  
  "teamName": String,
  "teamId": String
}
```

`'team_approved'` - Quiz master approved a team
```json  
{
  "teamId": String   
}
```

`'team_denied'` - Quiz master denied a team
```json
{
  "teamId": String  
}
```   

`'team_disconnected'` - A team disconnected
```json
{
  "teamId": String  
}
```

`'team_reconnected'` - A team reconnected
```json 
{
  "teamId": String  
}
```

## Quiz Lifecycle

`'quiz_starting'` - Quiz master begins the quiz
```json
{
  "quizId": String
}
```  

`'quiz_ended'` - Quiz master ends the quiz
```json
{
  "quizId": String
}
```

`'round_starting'` - Starting a new round
```json  
{
  "quizId": String, 
  "roundNumber": Number  
}
```

`'round_ended'` - Round completed
```json
{
  "quizId": String,
  "roundNumber": Number 
}
```

## Questions

`'new_question'` - New question started
```json 
{
  "questionId": String  
}
```  

`'question_answered'` - Team answered question
```json
{
  "questionId": String,  
  "teamId": String,
  "answer": String   
}
```

`'question_closed'` - No longer accepting answers
```json  
{
  "questionId": String
}
```

## Scoring

`'score_update'` - Sent when any team's score changes
```json  
{
  "teamId": String, 
  "score": Number      
}
```