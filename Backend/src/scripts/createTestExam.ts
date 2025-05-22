import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Group from '../models/Group';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestExam = async () => {
  try {
    // Get first group
    const groups = await Group.find().limit(1);
    
    if (groups.length === 0) {
      console.error('No groups found. Please create a group first.');
      process.exit(1);
    }
    
    const group = groups[0];
    console.log(`Using group: ${group.name} (${group._id})`);
    
    // Create a test quiz
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24); // End 24 hours from now
    
    const testPassword = 'testpass123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const quiz = new Quiz({
      adminId: group.creatorId,
      title: 'Test Exam - Available Now',
      description: 'This is a test exam created for testing purposes.',
      questions: [
        {
          type: 'MCQ',
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 1
        },
        {
          type: 'shortAnswer',
          text: 'What is the capital of France?',
          correctAnswer: 'Paris',
          points: 1
        }
      ],
      startTime,
      endTime,
      duration: 30,
      allowInternet: true,
      password: hashedPassword,
      isLive: true,
      groups: [group._id],
      autoSubmit: true,
      shuffleQuestions: false,
      showResults: true
    });
    
    await quiz.save();
    console.log(`Created test exam: ${quiz.title} (${quiz._id})`);
    
    // Add quiz to group
    await Group.findByIdAndUpdate(
      group._id,
      { $push: { exams: quiz._id } }
    );
    console.log(`Added exam to group ${group.name}`);
    
    console.log('\nExam Details:');
    console.log(`- Title: ${quiz.title}`);
    console.log(`- Start: ${startTime}`);
    console.log(`- End: ${endTime}`);
    console.log(`- Duration: ${quiz.duration} minutes`);
    console.log(`- Password: ${testPassword}`);
    console.log(`- Live: ${quiz.isLive}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test exam:', error);
    process.exit(1);
  }
};

createTestExam(); 