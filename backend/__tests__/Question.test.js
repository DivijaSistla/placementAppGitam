const sequelize= require('../config/sequelize');
const Question = require('../models/Question');

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);


describe('Question Model Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset DB before tests
  });

  test('should create a valid question', async () => {
    const question = await Question.create({
      company: 'TCS',
      course: 'CN',
      pyq: 'What is an IP Address?',
      concept: 'IP',
      course_code: 'CSEN2021',
      option_a: 'An unique identifier',
      option_b: 'A way to encrypt connections',
      option_c: 'An address that changes constantly',
      option_d: 'A manually assigned identifier',
      answer: 'OptionA',
    });

    expect(question.question_id).toBeDefined();
    expect(question.company).toBe('TCS');
    expect(question.answer).toBe('OptionA');
  });

  test('should not create a question without required fields', async () => {
    await expect(Question.create({ company: 'TCS' })) // Missing required fields
      .rejects.toThrow();
  });

  test('should fetch a question by ID', async () => {
    const question = await Question.create({
      company: 'PEGA',
      course: 'SOFTWARE ENGINEERING',
      pyq: 'Explain SDLC cycle?',
      concept: 'sdlc lifecycle',
      course_code: 'CSEN1131',
      option_a: 'planning, analysis, design, implementation, and maintenance',
      option_b: 'No simultaneous testing',
      option_c: 'A cycle only possible through Agile',
      option_d: 'The process of developing web applications',
      answer: 'OptionA',
    });

    const fetched = await Question.findByPk(question.question_id);
    expect(fetched.company).toBe('PEGA');
    expect(fetched.answer).toBe('OptionA');
  });

  test('should update a question', async () => {
    const question = await Question.create({
      company: 'ACCENTURE',
      course: 'PROGRAMMING WITH PYTHON',
      pyq: 'What are Pandas in Python?',
      concept: 'Libraries',
      course_code: 'CSEN1021',
      option_a: 'Pandas is a Python library for data analysis',
      option_b: 'A web frame work',
      option_c: 'An ML framework',
      option_d: 'None',
      answer: 'OptionB',
    });

    question.answer = 'OptionA';
    await question.save();

    const updated = await Question.findByPk(question.question_id);
    expect(updated.answer).toBe('OptionA');
  });

  test('should delete a question', async () => {
    const question = await Question.create({
      company: 'ACCENTURE',
      course: 'CNS',
      pyq: 'How many processes are there for changing a plaintext piece of data into encrypted data in AES - 128?',
      concept: 'encryption algorithms',
      course_code: 'CSEN2071',
      option_a: '10',
      option_b: '4',
      option_c: '8',
      option_d: '16',
      answer: 'OptionC',
    });

    await question.destroy();
    const deleted = await Question.findByPk(question.question_id);
    expect(deleted).toBeNull();
  });
  afterAll(async () => {
    await sequelize.close(); // proper cleanup
  });
    
});
