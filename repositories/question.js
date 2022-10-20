const { readFile, writeFile } = require('fs/promises')
const { v4: uuidv4 } = require('uuid')

const makeQuestionRepository = fileName => {
  const readFileAndParseQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    return JSON.parse(fileContent)
  }

  const serializeQuestionsAndSaveFile = async questions => {
    const serializedQuestions = JSON.stringify(questions)
    await writeFile(fileName, serializedQuestions, { encoding: 'utf-8' })
  }

  const getQuestions = async () => {
    return await readFileAndParseQuestions()
  }

  const getQuestionById = async questionId => {
    const questions = await readFileAndParseQuestions()
    return questions.find(q => q.id === questionId) ?? null
  }

  const addQuestion = async questionDTO => {
    if (!questionDTO.author || !questionDTO.summary) {
      throw new Error('Invalid author or summary')
    }
    const questions = await readFileAndParseQuestions()
    const question = {
      id: uuidv4(),
      answers: [],
      ...questionDTO
    }
    questions.push(question)
    await serializeQuestionsAndSaveFile(questions)
    return question
  }

  const getAnswers = async questionId => {
    const question = await getQuestionById(questionId)
    return question ? question.answers : null
  }

  const getAnswerById = async (questionId, answerId) => {
    const answers = await getAnswers(questionId)
    if (!answers) {
      return null
    }
    return answers.find(a => a.id === answerId) ?? null
  }

  const addAnswer = async (questionId, answerDTO) => {
    if (!answerDTO.author || !answerDTO.summary) {
      throw new Error('Invalid author or summary')
    }
    const questions = await getQuestions()
    const question = questions.find(q => q.id === questionId)
    if (!question) {
      throw new Error('Invalid questionId')
    }
    const answer = {
      id: uuidv4(),
      ...answerDTO
    }
    question.answers.push(answer)
    await serializeQuestionsAndSaveFile(questions)
    return answer
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswerById,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
