import mongoose from 'mongoose';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import Review from '../models/Review.js';

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected to publiccare database: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure MongoDB is running on localhost:27017');
      console.error('💡 Start MongoDB with: mongod --dbpath /path/to/your/db');
    }
    
    process.exit(1);
  }
};

// Function to create indexes for better performance
export const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');

    // Create indexes for User collection
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ department: 1 });
    await User.collection.createIndex({ isActive: 1 });

    // Create indexes for Complaint collection
    await Complaint.collection.createIndex({ location: '2dsphere' });
    await Complaint.collection.createIndex({ status: 1, priority: -1, createdAt: -1 });
    await Complaint.collection.createIndex({ submittedBy: 1, status: 1 });
    await Complaint.collection.createIndex({ assignedTo: 1, status: 1 });
    await Complaint.collection.createIndex({ department: 1, status: 1 });
    await Complaint.collection.createIndex({ category: 1, status: 1 });
    await Complaint.collection.createIndex({ isEmergency: 1, status: 1 });
    await Complaint.collection.createIndex({ 'metadata.referenceNumber': 1 }, { unique: true });

    // Create indexes for Department collection
    await Department.collection.createIndex({ code: 1 }, { unique: true });
    await Department.collection.createIndex({ categories: 1 });
    await Department.collection.createIndex({ isActive: 1 });
    await Department.collection.createIndex({ 'serviceAreas.zipCodes': 1 });

    // Create indexes for Review collection
    await Review.collection.createIndex({ complaint: 1, user: 1 }, { unique: true });
    await Review.collection.createIndex({ department: 1, status: 1, createdAt: -1 });
    await Review.collection.createIndex({ category: 1, rating: -1, createdAt: -1 });
    await Review.collection.createIndex({ rating: -1, createdAt: -1 });
    await Review.collection.createIndex({ status: 1, createdAt: -1 });
    await Review.collection.createIndex({ 'helpfulVotes.count': -1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Function to check database health
export const checkDatabaseHealth = async () => {
  try {
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    
    if (result.ok === 1) {
      console.log('💚 Database health check: OK');
      
      // Get database stats
      const stats = await mongoose.connection.db.stats();
      console.log(`📈 Database stats: ${stats.collections} collections, ${stats.objects} documents`);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

export default connectDB;