# File Upload Troubleshooting Guide

## Error: "Failed to upload [filename]: File upload failed"

This error occurs when the file upload to Cloudinary fails. Here are the steps to troubleshoot:

### 1. Check Cloudinary Configuration

First, test if Cloudinary is properly configured:

```bash
# Make sure you're logged in to the application
# Then visit: http://localhost:5000/api/v1/upload/test
```

Or use curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/v1/upload/test
```

### 2. Check Environment Variables

Make sure you have a `.env` file in the `Backend` directory with:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Verify Cloudinary Account

1. **Create a Cloudinary account** at https://cloudinary.com/
2. **Get your credentials** from your Cloudinary dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 4. Check File Requirements

- **File size**: Maximum 10MB per file
- **File types**: Images (JPEG, PNG, GIF), Videos (MP4, MOV, AVI), Documents (PDF, DOC, DOCX)
- **File name**: Avoid special characters in filenames

### 5. Check Backend Logs

Look at the backend console for detailed error messages:

```bash
cd Backend
npm run dev
```

Look for error messages like:
- "Cloudinary configuration missing"
- "Cloudinary upload error"
- Network connectivity issues

### 6. Common Issues and Solutions

#### Issue: "File upload service not configured"
**Solution**: Add Cloudinary credentials to `.env` file

#### Issue: "Invalid file type"
**Solution**: Check file extension and MIME type

#### Issue: "File too large"
**Solution**: Reduce file size to under 10MB

#### Issue: Network connectivity
**Solution**: Check internet connection and firewall settings

### 7. Test with a Simple Image

Try uploading a simple JPEG image first to test the setup.

### 8. Alternative: Use Local Storage (Development Only)

If Cloudinary is not working, you can temporarily use local storage for development:

1. Create a `uploads` folder in the Backend directory
2. Modify the upload controller to save files locally
3. Serve files through a static route

### 9. Check Browser Console

Open browser developer tools and check the Network tab to see:
- Request/response details
- Error status codes
- Response body for error messages

### 10. Verify Backend Server

Make sure the backend server is running:

```bash
cd Backend
npm run dev
```

The server should start without errors and show:
```
Server running on port 5000
MongoDB connected
```

### Still Having Issues?

1. Check the backend console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a different file
4. Check if Cloudinary service is accessible from your network 

---

## **Why is this happening?**

- Your backend expects a user object (probably from authentication middleware), but it is missing.
- Most likely, you are making a request to a protected route (like `/api/v1/upload` or `/api/v1/upload/test`) **without a valid Authorization header** (Bearer token).
- The code tries to access `req.user.token` or similar, but `req.user` is `undefined`.

---

## **How to Fix**

1. **Make sure you are logged in on the frontend.**
   - The frontend should send the JWT token in the Authorization header.
   - If you are testing with Postman or curl, include the header:
     ```
     Authorization: Bearer YOUR_JWT_TOKEN
     ```

2. **Check your authentication middleware.**
   - Make sure it sets `req.user` correctly if the token is valid.
   - If the token is missing or invalid, it should return a 401 error, not crash the app.

3. **Add a null/undefined check before accessing `.token`.**
   - Example:
     ```js
     if (req.user && req.user.token) {
       // safe to use req.user.token
     }
     ```

4. **Restart your backend after fixing the code.**

---

## **Summary**

- This is an authentication issue, not a Cloudinary or upload issue.
- You are trying to access `.token` on something that is `undefined`.
- Make sure you are sending a valid JWT token with your requests.
- Add checks in your code to avoid accessing properties on `undefined`.

---

**If you share the full stack trace or the code where `.token` is accessed, I can give you an exact line to fix!**  
But the main fix is: **always check if the object exists before accessing its properties.** 