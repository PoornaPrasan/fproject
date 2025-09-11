import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models to ensure they're registered
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import Review from '../models/Review.js';

dotenv.config();

const createCollections = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/publiccare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to publiccare database');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Get database instance
    const db = mongoose.connection.db;

    // List of collections to create
    const collections = [
      {
        name: 'users',
        model: User,
        description: 'User accounts (citizens, providers, admins)'
      },
      {
        name: 'complaints',
        model: Complaint,
        description: 'Public service complaints and issues'
      },
      {
        name: 'departments',
        model: Department,
        description: 'Government departments and service providers'
      },
      {
        name: 'reviews',
        model: Review,
        description: 'User reviews and ratings for resolved complaints'
      }
    ];

    console.log('\n📋 Creating collections and indexes...\n');

    for (const collection of collections) {
      try {
        // Check if collection exists
        const existingCollections = await db.listCollections({ name: collection.name }).toArray();
        
        if (existingCollections.length > 0) {
          console.log(`✅ Collection '${collection.name}' already exists`);
        } else {
          // Create collection by inserting and removing a dummy document
          await db.createCollection(collection.name);
          console.log(`✨ Created collection '${collection.name}'`);
        }

        // Ensure indexes are created
        await collection.model.createIndexes();
        console.log(`🔍 Created indexes for '${collection.name}'`);
        console.log(`   📝 ${collection.description}`);
        
      } catch (error) {
        console.error(`❌ Error with collection '${collection.name}':`, error.message);
      }
    }

    // Create additional indexes for geospatial queries
    console.log('\n🌍 Creating geospatial indexes...');
    
    try {
      await db.collection('complaints').createIndex({ "location": "2dsphere" });
      console.log('✅ Created 2dsphere index for complaints location');
    } catch (error) {
      console.log('ℹ️  Geospatial index already exists or error:', error.message);
    }

    // Display final database status
    console.log('\n📊 Final Database Status:');
    const stats = await db.stats();
    const allCollections = await db.listCollections().toArray();
    
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collections: ${allCollections.length}`);
    console.log(`   Documents: ${stats.objects}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📋 Available Collections:');
    allCollections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run "npm run seed" to populate with sample data');
    console.log('   2. Start the server with "npm run dev"');
    console.log('   3. Test the API at http://localhost:5000/api/health');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB Connection Tips:');
      console.error('   - Make sure MongoDB is running: mongod');
      console.error('   - Check if MongoDB is listening on localhost:27017');
      console.error('   - Verify your MongoDB installation');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createCollections();