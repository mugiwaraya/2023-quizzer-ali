const mongoose = require('mongoose');
const { Question } = require('../domain/question/question.model');
const fs = require('fs/promises');
const path = require('path');

// Helper function to print messages
const print = (message, object = '') => {
  if (process.env.NODE_ENV !== 'test') console.log(message, object);
};

// Seed function to insert questions into the database
const seedQuestions = async () => {
  print('\nSeeding database with Questions');

  // Step 1: Drop the existing questions collection
  print('\tStep 1: Deleting existing questions...');
  try {
    await Question.collection.drop();
    print('\t\tok!');
  } catch (err) {
    print('\t\terror!', err.message);
  }

  // Step 2: Read questions from the JSON file
  print('\tStep 2: Reading questions from files...');
  let data = [];
  try {
    const file = await fs.readFile(path.join('src', 'utils', 'questions_en.json'), 'utf-8');
    data = JSON.parse(file);
    print('\t\tok!');
  } catch (err) {
    print('\t\terror!', err.message);
    return 1;
  }

  // Step 3: Map file data to Question objects
  print('\tStep 3: Mapping file data to question documents...');
  const questions = data.map(({ question, answer, category }) => ({
    question,
    answer,
    category,
  }));
  print('\t\tok!');

  // Step 4: Insert all questions into the database
  print('\tStep 4: Saving all question documents to the database...');
  try {
    const result = await Question.insertMany(questions);
    const insertedCount = result.length;
    print(`\t\tok! ${insertedCount} questions inserted.`);
  } catch (err) {
    if (err.code === 11000) {
      print('\t\terror! Question already exists!'); // MongoDB Duplicate key error
    } else {
      print('\t\terror! Saving questions:', err);
    }
  }
};

// Main function to connect and seed the database
const main = async () => {
  try {
    // Connect to MongoDB
    print('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    print('ok!');

    // Seed the database with questions
    await seedQuestions();

    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

// Export the main function
module.exports = main;

// Call the main function if this script is executed directly
if (require.main === module) {
  main();
}
