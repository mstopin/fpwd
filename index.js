const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const { questionId } = req.params
  const question = await req.repositories.questionRepo.getQuestionById(
    questionId
  )
  if (!question) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(question)
})

app.post('/questions', async (req, res) => {
  const { author, summary } = req.body
  if (!author || !summary) {
    res.status(401).json({ error: 'Invalid author or summary' })
    return
  }
  try {
    const question = await req.repositories.questionRepo.addQuestion({
      author,
      summary
    })
    res.json(question)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
})

app.get('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params
  const answers = await req.repositories.questionRepo.getAnswers(questionId)
  if (!answers) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(answers)
})

app.post('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params
  const { author, summary } = req.body
  if (!author || !summary) {
    res.status(401).json({ error: 'Invalid author or summary' })
    return
  }
  try {
    const answer = await req.repositories.questionRepo.addAnswer(questionId, {
      author,
      summary
    })
    res.json(answer)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
  const { questionId, answerId } = req.params
  const answer = await req.repositories.questionRepo.getAnswerById(
    questionId,
    answerId
  )
  if (!answer) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  return res.json(answer)
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
