# PublicCare Backend API

A comprehensive Node.js + Express.js backend for the Public Service Complaints Management System.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Citizens, Service Providers, and Administrators
- **Complaint Management**: Full CRUD operations with status tracking
- **Department Management**: Organize service providers by departments
- **Real-time Updates**: Socket.IO for live notifications
- **File Uploads**: Cloudinary integration for attachments
- **Analytics**: Comprehensive reporting and analytics
- **Email Notifications**: Automated email updates
- **Data Validation**: Comprehensive input validation
- **Security**: Rate limiting, CORS, data sanitization
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret
   - Email configuration (optional)
   - Cloudinary credentials (optional)

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen",
  "phone": "+1-555-0123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Complaints

#### Get All Complaints
```http
GET /complaints?page=1&limit=25&status=submitted&category=water
```

#### Create Complaint
```http
POST /complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Water leak on Main Street",
  "description": "Large water leak causing flooding",
  "category": "water",
  "priority": "high",
  "isEmergency": true,
  "location": {
    "coordinates": [-74.0060, 40.7128],
    "address": "123 Main Street",
    "city": "New York",
    "region": "NY"
  }
}
```

#### Update Complaint Status
```http
PUT /complaints/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "assignedTo": "provider_user_id"
}
```

#### Add Update to Complaint
```http
POST /complaints/:id/updates
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Work has begun on the water leak repair",
  "type": "progress_update"
}
```

### Users

#### Get All Users (Admin only)
```http
GET /users?page=1&limit=25&role=provider
Authorization: Bearer <admin_token>
```

#### Get User Statistics
```http
GET /users/:id/stats
Authorization: Bearer <token>
```

### Departments

#### Get All Departments
```http
GET /departments
```

#### Create Department (Admin only)
```http
POST /departments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Water Department",
  "description": "Manages water supply and sewage",
  "categories": ["water", "sanitation"],
  "contactInfo": {
    "email": "water@city.gov",
    "phone": "+1-555-1000",
    "address": "123 City Hall"
  },
  "head": "user_id"
}
```

### Analytics

#### System Analytics (Admin only)
```http
GET /analytics/system
Authorization: Bearer <admin_token>
```

#### Department Analytics
```http
GET /analytics/department/:id
Authorization: Bearer <token>
```

### File Upload

#### Upload File
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
```

## Database Models

### User
- **Fields**: name, email, password, role, phone, avatar, department, preferences
- **Roles**: citizen, provider, admin
- **Features**: Password hashing, JWT tokens, email verification

### Complaint
- **Fields**: title, description, category, status, priority, location, attachments
- **Status Flow**: submitted → under_review → in_progress → resolved
- **Features**: Geolocation, file attachments, status updates, ratings

### Department
- **Fields**: name, categories, contactInfo, staff, workingHours, SLA
- **Features**: Service area mapping, performance tracking, staff management

## Real-time Features

The API includes Socket.IO for real-time updates:

- **New Complaints**: Notify admins and relevant providers
- **Status Updates**: Notify complaint submitters
- **Emergency Alerts**: Immediate notifications for emergency complaints
- **Assignment Updates**: Notify when complaints are assigned

### Socket Events

```javascript
// Client-side example
socket.on('new-complaint', (data) => {
  console.log('New complaint:', data.complaint);
});

socket.on('status-update', (data) => {
  console.log('Status changed:', data.oldStatus, '→', data.newStatus);
});
```

## Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevent API abuse
- **Data Validation**: Comprehensive input validation
- **Data Sanitization**: Prevent NoSQL injection
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation error details"]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No (default: 7d) |
| `EMAIL_HOST` | SMTP host | No |
| `EMAIL_USERNAME` | SMTP username | No |
| `EMAIL_PASSWORD` | SMTP password | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No |

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Setup

1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas or dedicated MongoDB server
3. **File Storage**: Configure Cloudinary for file uploads
4. **Email**: Configure SMTP for email notifications
5. **Security**: Use strong JWT secrets and enable HTTPS

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## API Rate Limits

- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **File Upload**: 10 uploads per hour per user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details