# File Upload Setup Instructions

## Overview
The photos and videos attached to complaints are now properly uploaded to Cloudinary and saved in MongoDB. Here's how to set up the file upload functionality.

## Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/publiccare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Cloudinary Setup

1. **Create a Cloudinary account** at https://cloudinary.com/
2. **Get your credentials** from your Cloudinary dashboard
3. **Update the .env file** with your Cloudinary credentials

## Running the Application

1. **Start the backend server**:
   ```bash
   cd Backend
   npm install
   npm run dev
   ```

2. **Start the frontend server**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## Testing File Upload

1. **Submit a complaint** with photos/videos attached
2. **Check the MongoDB database** - complaints should now have real attachment URLs
3. **Verify attachments are accessible** via the URLs stored in the database

## Files Updated

The following files were updated to fix the file upload issue:

1. **Frontend/src/pages/citizen/SubmitComplaint.tsx**
   - Modified `handleSubmit` to upload files before submitting complaints
   - Added proper error handling for file uploads

2. **Frontend/src/contexts/ComplaintContext.tsx**
   - Updated `addComplaintUpdate` to properly upload files
   - Made the function async to handle file uploads

3. **Frontend/src/pages/provider/ComplaintManagement.tsx**
   - Updated `handleAddUpdate` to handle async file uploads

## How It Works

1. **File Selection**: Users select files using the file input
2. **File Upload**: Files are uploaded to Cloudinary via `/api/v1/upload`
3. **URL Storage**: Real URLs from Cloudinary are stored in MongoDB
4. **Display**: Attachments are displayed using the stored URLs

## Troubleshooting

- **Upload fails**: Check Cloudinary credentials in `.env` file
- **Files not showing**: Verify MongoDB connection and check attachment URLs
- **Large files**: Files are limited to 10MB per file, max 5 files per complaint 