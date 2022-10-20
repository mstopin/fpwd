const { writeFile, readFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  const testQuestions = [
    {
      id: faker.datatype.uuid(),
      summary: 'What is my name?',
      author: 'Jack London',
      answers: [
        {
          id: faker.datatype.uuid(),
          summary: 'Who knows',
          author: 'Some guy'
        }
      ]
    },
    {
      id: faker.datatype.uuid(),
      summary: 'Who are you?',
      author: 'Tim Doods',
      answers: [
        {
          id: faker.datatype.uuid(),
          summary: 'Who knows',
          author: 'Some guy'
        }
      ]
    },
    {
      id: faker.datatype.uuid(),
      summary: 'Some summary',
      author: 'Some author',
      answers: []
    }
  ]
  let questionRepo

  beforeEach(async () => {
    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterEach(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  describe('getQuestions', () => {
    test('should return a list of 0 questions', async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))

      expect(await questionRepo.getQuestions()).toHaveLength(0)
    })

    test('should return a list of 3 questions', async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

      expect(await questionRepo.getQuestions()).toHaveLength(3)
    })
  })

  describe('getQuestionById', () => {
    test('should return question', async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

      const expectedQuestion = testQuestions[1]
      const actualQuestion = await questionRepo.getQuestionById(
        expectedQuestion.id
      )
      expect(actualQuestion).toStrictEqual(expectedQuestion)
    })

    test('should return null', async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

      const actualQuestion = await questionRepo.getQuestionById('uuid')
      expect(actualQuestion).toBe(null)
    })
  })

  describe('addQuestion', () => {
    beforeEach(async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))
    })

    test('should add question', async () => {
      await questionRepo.addQuestion({
        author: 'Author',
        summary: 'Summary'
      })

      const actualQuestions = JSON.parse(
        await readFile(TEST_QUESTIONS_FILE_PATH, { encoding: 'utf-8' })
      )

      expect(actualQuestions).toHaveLength(1)
      expect(actualQuestions[0].id).toBeDefined()
      expect(actualQuestions[0].answers).toStrictEqual([])
      expect(actualQuestions[0].author).toBe('Author')
      expect(actualQuestions[0].summary).toBe('Summary')
    })

    test('should throw if given invalid data', async () => {
      await expect(
        questionRepo.addQuestion({
          author: 'Author',
          summary: ''
        })
      ).rejects.toThrow('Invalid author or summary')
      await expect(
        questionRepo.addQuestion({
          author: '',
          summary: 'Summary'
        })
      ).rejects.toThrow('Invalid author or summary')
    })
  })

  describe('getAnswers', () => {
    beforeEach(async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    })

    test('should return a list of 1 answer', async () => {
      const actualAnswers = await questionRepo.getAnswers(testQuestions[0].id)

      expect(actualAnswers).toHaveLength(1)
    })

    test('should return a list of 0 answers', async () => {
      const actualAnswers = await questionRepo.getAnswers(testQuestions[2].id)

      expect(actualAnswers).toHaveLength(0)
    })

    test('should return null', async () => {
      const actualAnswers = await questionRepo.getAnswers('uuid')

      expect(actualAnswers).toBe(null)
    })
  })

  describe('getAnswerById', () => {
    beforeEach(async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    })

    test('should return an answer', async () => {
      const expectedAnswer = testQuestions[0].answers[0]
      const actualAnswer = await questionRepo.getAnswerById(
        testQuestions[0].id,
        expectedAnswer.id
      )

      expect(actualAnswer).toStrictEqual(expectedAnswer)
    })

    test('should return null for non existing question', async () => {
      const actualAnswer = await questionRepo.getAnswerById(
        'uuid',
        testQuestions[0].answers[0].id
      )

      expect(actualAnswer).toBe(null)
    })

    test('should return null for non existing answer', async () => {
      const actualAnswer = await questionRepo.getAnswerById(
        testQuestions[0].id,
        'uuid'
      )

      expect(actualAnswer).toBe(null)
    })

    test('should return null for answer of other question', async () => {
      const actualAnswer = await questionRepo.getAnswerById(
        testQuestions[0].id,
        testQuestions[1].answers[0].id
      )

      expect(actualAnswer).toBe(null)
    })
  })

  describe('addAnwser', () => {
    beforeEach(async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    })

    test('should add answer', async () => {
      await questionRepo.addAnswer(testQuestions[2].id, {
        author: 'Some author',
        summary: 'Some summary'
      })

      const actualQuestions = JSON.parse(
        await readFile(TEST_QUESTIONS_FILE_PATH, { encoding: 'utf-8' })
      )

      expect(actualQuestions[2].answers).toHaveLength(1)
      expect(actualQuestions[2].answers[0].id).toBeDefined()
      expect(actualQuestions[2].answers[0].author).toBe('Some author')
      expect(actualQuestions[2].answers[0].summary).toBe('Some summary')
    })

    test('should throw if given non existing questionId', async () => {
      await expect(
        questionRepo.addAnswer('uuid', {
          author: 'Some author',
          summary: 'Some summary'
        })
      ).rejects.toThrow('Invalid questionId')
    })

    test('should throw if given invalid data', async () => {
      await expect(
        questionRepo.addAnswer('uuid', {
          author: 'Author',
          summary: ''
        })
      ).rejects.toThrow('Invalid author or summary')
      await expect(
        questionRepo.addAnswer('uuid', {
          author: '',
          summary: 'Summary'
        })
      ).rejects.toThrow('Invalid author or summary')
    })
  })
})
