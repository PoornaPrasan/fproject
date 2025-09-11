import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Review from '../models/Review.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/publiccare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for publiccare database...');

    // Clear existing data (optional, uncomment if you want to clear collections)
    // await User.deleteMany({});
    // await Department.deleteMany({});
    // await Complaint.deleteMany({});
    // await Review.deleteMany({});
    // console.log('✅ Cleared existing data from publiccare database');

    // Add your real data creation logic here, e.g.:
    // await User.create({ name: 'Real User', email: 'real@example.com', ... });
    // await Department.create({ ... });
    // ...

    // Create departments
    const departments = await Department.create([
      {
        name: 'Water Services Department',
        code: 'WATER',
        description: 'Responsible for water supply, quality, and related infrastructure',
        categories: ['water', 'drainage'],
        contactInfo: {
          email: 'water@publiccare.gov',
          phone: '+1-555-0100',
          address: {
            street: '123 Water St',
            city: 'New York',
            region: 'NY',
            zipCode: '10001'
          }
        },
        workingHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'saturday', isOpen: false, openTime: '09:00', closeTime: '12:00' },
          { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '12:00' }
        ],
        serviceAreas: [{
          type: 'city',
          name: 'New York City',
          zipCodes: ['10001', '10002', '10003', '10004', '10005']
        }],
        isActive: true,
        color: '#3B82F6'
      },
      {
        name: 'Electrical Services Department',
        code: 'ELECTRIC',
        description: 'Manages electrical infrastructure and street lighting',
        categories: ['electricity', 'street_lights'],
        contactInfo: {
          email: 'electric@publiccare.gov',
          phone: '+1-555-0200',
          address: {
            street: '456 Electric Ave',
            city: 'New York',
            region: 'NY',
            zipCode: '10002'
          }
        },
        serviceAreas: [{
          type: 'city',
          name: 'New York City',
          zipCodes: ['10001', '10002', '10003', '10004', '10005']
        }],
        isActive: true,
        color: '#F59E0B'
      },
      {
        name: 'Public Works Department',
        code: 'ROADS',
        description: 'Maintains roads, bridges, and transportation infrastructure',
        categories: ['roads', 'public_transport'],
        contactInfo: {
          email: 'roads@publiccare.gov',
          phone: '+1-555-0300',
          address: {
            street: '789 Main St',
            city: 'New York',
            region: 'NY',
            zipCode: '10003'
          }
        },
        serviceAreas: [{
          type: 'city',
          name: 'New York City',
          zipCodes: ['10001', '10002', '10003', '10004', '10005']
        }],
        isActive: true,
        color: '#10B981'
      },
      {
        name: 'Sanitation Department',
        code: 'SANITATION',
        description: 'Waste management and environmental services',
        categories: ['sanitation'],
        contactInfo: {
          email: 'sanitation@publiccare.gov',
          phone: '+1-555-0400',
          address: {
            street: '321 Clean St',
            city: 'New York',
            region: 'NY',
            zipCode: '10004'
          }
        },
        serviceAreas: [{
          type: 'city',
          name: 'New York City',
          zipCodes: ['10001', '10002', '10003', '10004', '10005']
        }],
        isActive: true,
        color: '#8B5CF6'
      }
    ]);
    console.log('✅ Created departments');

    // Create provider users
    const providers = await User.create([
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@publiccare.gov',
        password: 'provider123',
        role: 'provider',
        phone: '+1-555-1001',
        department: departments[0].name, // Water Services
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@publiccare.gov',
        password: 'provider123',
        role: 'provider',
        phone: '+1-555-1002',
        department: departments[1].name, // Electrical Services
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Emily Chen',
        email: 'emily.chen@publiccare.gov',
        password: 'provider123',
        role: 'provider',
        phone: '+1-555-1003',
        department: departments[2].name, // Public Works
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'David Rodriguez',
        email: 'david.rodriguez@publiccare.gov',
        password: 'provider123',
        role: 'provider',
        phone: '+1-555-1004',
        department: departments[3].name, // Sanitation
        isActive: true,
        isEmailVerified: true
      }
    ]);
    console.log('✅ Created provider users');

    // Update departments with staff
    for (let i = 0; i < departments.length; i++) {
      departments[i].staff.push({
        user: providers[i]._id,
        position: 'Senior Technician',
        permissions: ['view', 'assign', 'update', 'resolve']
      });
      departments[i].head = providers[i]._id;
      await departments[i].save();
    }
    console.log('✅ Updated departments with staff');

    // Create citizen users
    const citizens = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'citizen123',
        role: 'citizen',
        phone: '+1-555-2001',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        password: 'citizen123',
        role: 'citizen',
        phone: '+1-555-2002',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        password: 'citizen123',
        role: 'citizen',
        phone: '+1-555-2003',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Lisa Davis',
        email: 'lisa.davis@email.com',
        password: 'citizen123',
        role: 'citizen',
        phone: '+1-555-2004',
        isActive: true,
        isEmailVerified: true
      }
    ]);
    console.log('✅ Created citizen users');

    // Create sample complaints
    const complaints = await Complaint.create([
      {
        title: 'Water pressure issue in downtown area',
        description: 'Low water pressure affecting multiple buildings on Main Street. Issue started yesterday morning.',
        category: 'water',
        priority: 'high',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
          address: '123 Main Street',
          city: 'New York',
          region: 'NY',
          zipCode: '10001'
        },
        submittedBy: citizens[0]._id,
        assignedTo: providers[0]._id,
        department: departments[0]._id,
        status: 'resolved',
        isEmergency: false,
        resolution: {
          description: 'Replaced faulty pressure valve and restored normal water pressure.',
          resolvedBy: providers[0]._id,
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        actualResolutionTime: 48,
        feedback: {
          rating: 5,
          comment: 'Excellent service! Problem was fixed quickly and professionally.',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        updates: [
          {
            message: 'Complaint received and assigned to water services team.',
            type: 'status_change',
            createdBy: adminUser._id
          },
          {
            message: 'Technician dispatched to investigate the issue.',
            type: 'progress_update',
            createdBy: providers[0]._id
          },
          {
            message: 'Issue resolved. Water pressure restored to normal levels.',
            type: 'status_change',
            createdBy: providers[0]._id
          }
        ]
      },
      {
        title: 'Broken streetlight on Oak Avenue',
        description: 'Streetlight pole #456 on Oak Avenue has been out for 3 days, creating safety concerns.',
        category: 'street_lights',
        priority: 'medium',
        location: {
          type: 'Point',
          coordinates: [-74.0070, 40.7138],
          address: '456 Oak Avenue',
          city: 'New York',
          region: 'NY',
          zipCode: '10002'
        },
        submittedBy: citizens[1]._id,
        assignedTo: providers[1]._id,
        department: departments[1]._id,
        status: 'in_progress',
        isEmergency: false,
        updates: [
          {
            message: 'Complaint received and assigned to electrical services.',
            type: 'assignment',
            createdBy: adminUser._id
          },
          {
            message: 'Technician scheduled for tomorrow morning to replace the bulb.',
            type: 'progress_update',
            createdBy: providers[1]._id
          }
        ]
      },
      {
        title: 'Pothole on Highway 101',
        description: 'Large pothole causing damage to vehicles. Located near mile marker 15.',
        category: 'roads',
        priority: 'high',
        location: {
          type: 'Point',
          coordinates: [-74.0080, 40.7148],
          address: 'Highway 101, Mile 15',
          city: 'New York',
          region: 'NY',
          zipCode: '10003'
        },
        submittedBy: citizens[2]._id,
        assignedTo: providers[2]._id,
        department: departments[2]._id,
        status: 'under_review',
        isEmergency: false,
        updates: [
          {
            message: 'Complaint received and under review by road maintenance team.',
            type: 'status_change',
            createdBy: adminUser._id
          }
        ]
      },
      {
        title: 'Missed garbage collection',
        description: 'Garbage has not been collected for 2 weeks on Elm Street. Bins are overflowing.',
        category: 'sanitation',
        priority: 'medium',
        location: {
          type: 'Point',
          coordinates: [-74.0090, 40.7158],
          address: '789 Elm Street',
          city: 'New York',
          region: 'NY',
          zipCode: '10004'
        },
        submittedBy: citizens[3]._id,
        assignedTo: providers[3]._id,
        department: departments[3]._id,
        status: 'resolved',
        isEmergency: false,
        resolution: {
          description: 'Scheduled additional pickup and resolved route scheduling issue.',
          resolvedBy: providers[3]._id,
          resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        actualResolutionTime: 72,
        feedback: {
          rating: 4,
          comment: 'Good response, but took a bit longer than expected.',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      },
      {
        title: 'Emergency water main break',
        description: 'Major water main break flooding the intersection of 1st and Broadway. Immediate attention required.',
        category: 'water',
        priority: 'critical',
        location: {
          type: 'Point',
          coordinates: [-74.0100, 40.7168],
          address: '1st Street & Broadway',
          city: 'New York',
          region: 'NY',
          zipCode: '10005'
        },
        submittedBy: citizens[0]._id,
        assignedTo: providers[0]._id,
        department: departments[0]._id,
        status: 'resolved',
        isEmergency: true,
        resolution: {
          description: 'Emergency crew dispatched immediately. Water main repaired and street cleaned.',
          resolvedBy: providers[0]._id,
          resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        actualResolutionTime: 6,
        feedback: {
          rating: 5,
          comment: 'Incredible emergency response! Fixed within hours.',
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      }
    ]);
    console.log('✅ Created sample complaints');

    // Create sample reviews
    const reviews = await Review.create([
      {
        complaint: complaints[0]._id,
        user: citizens[0]._id,
        department: departments[0]._id,
        serviceProvider: providers[0]._id,
        title: 'Excellent Water Service Repair',
        content: 'The water department responded quickly to my complaint about low water pressure. The technician was professional, explained the issue clearly, and fixed it within 2 days. Very impressed with the service quality!',
        rating: 5,
        aspects: {
          responseTime: 5,
          communication: 5,
          quality: 5,
          professionalism: 5
        },
        category: 'water',
        location: {
          address: '123 Main Street',
          city: 'New York',
          region: 'NY',
          zipCode: '10001'
        },
        helpfulVotes: { count: 12, users: [citizens[1]._id, citizens[2]._id] },
        notHelpfulVotes: { count: 1, users: [] },
        status: 'approved'
      },
      {
        complaint: complaints[3]._id,
        user: citizens[3]._id,
        department: departments[3]._id,
        serviceProvider: providers[3]._id,
        title: 'Sanitation Service - Good but Slow',
        content: 'The garbage collection issue was eventually resolved, but it took longer than expected. The crew was friendly when they came, but communication could be better. Overall satisfied with the outcome.',
        rating: 4,
        aspects: {
          responseTime: 3,
          communication: 3,
          quality: 4,
          professionalism: 4
        },
        category: 'sanitation',
        location: {
          address: '789 Elm Street',
          city: 'New York',
          region: 'NY',
          zipCode: '10004'
        },
        helpfulVotes: { count: 5, users: [citizens[0]._id] },
        notHelpfulVotes: { count: 2, users: [] },
        status: 'approved'
      },
      {
        complaint: complaints[4]._id,
        user: citizens[0]._id,
        department: departments[0]._id,
        serviceProvider: providers[0]._id,
        title: 'Outstanding Emergency Response',
        content: 'Water main break was resolved within 6 hours of reporting! The emergency crew worked efficiently and kept us updated throughout the process. Excellent emergency response system.',
        rating: 5,
        aspects: {
          responseTime: 5,
          communication: 5,
          quality: 5,
          professionalism: 5
        },
        category: 'water',
        location: {
          address: '1st Street & Broadway',
          city: 'New York',
          region: 'NY',
          zipCode: '10005'
        },
        helpfulVotes: { count: 20, users: [citizens[1]._id, citizens[2]._id, citizens[3]._id] },
        notHelpfulVotes: { count: 0, users: [] },
        status: 'approved'
      }
    ]);
    console.log('✅ Created sample reviews');

    // Update department performance metrics
    for (const department of departments) {
      await department.updatePerformance();
    }
    console.log('✅ Updated department performance metrics');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('👑 Admin: admin@publiccare.gov / admin123');
    console.log('🔧 Provider: sarah.wilson@publiccare.gov / provider123');
    console.log('👤 Citizen: john.doe@email.com / citizen123');
    console.log('\n🌐 You can now start the server and test the API endpoints!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedDatabase();