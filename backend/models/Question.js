const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Question = sequelize.define('Question', {
  question_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  pyq: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  concept: {
    type: DataTypes.STRING(100),
  },
  course_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  option_a: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_b: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_c: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_d: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answer: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'questions', // Explicitly set the table name
  timestamps: false, // Disable createdAt and updatedAt
});

module.exports = Question; // Ensure this line is present