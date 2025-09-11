import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import User from '../models/User.js'; // Only needed if you want to assign a head

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/publiccare';

async function addDepartment() {
  await mongoose.connect(MONGO_URI);

  // Find a user to assign as department head (replace with a real user ID from your DB)
  const head = await User.findOne(); // Or use a specific user: await User.findById('SOME_USER_ID');

  if (!head) {
    console.log('No user found to assign as department head. Please create a user first.');
    process.exit(1);
  }

  const department = new Department({
    name: 'Water Department',
    description: 'Handles water supply issues',
    categories: ['water'],
    contactInfo: {
      email: 'waterdept@example.com',
      phone: '+1234567890',
      address: '123 Water St, City',
      website: 'https://waterdept.example.com',
      emergencyContact: '+1234567890'
    },
    workingHours: {
      monday: { start: '09:00', end: '17:00', isClosed: false },
      tuesday: { start: '09:00', end: '17:00', isClosed: false },
      wednesday: { start: '09:00', end: '17:00', isClosed: false },
      thursday: { start: '09:00', end: '17:00', isClosed: false },
      friday: { start: '09:00', end: '17:00', isClosed: false },
      saturday: { start: '09:00', end: '13:00', isClosed: false },
      sunday: { start: '', end: '', isClosed: true }
    },
    sla: [],
    head: head._id,
    staff: [],
    serviceAreas: [],
    budget: {},
    performance: {},
    isActive: true,
    tags: []
  });

  await department.save();
  console.log('Department added:', department);
  process.exit(0);
}

addDepartment().catch(err => {
  console.error('Error adding department:', err);
  process.exit(1);
});
