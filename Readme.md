# Videotweet (YouTube + Twitter Clone)

## Description
Videotube is a backend project that combines features of YouTube and Twitter, built using Node.js and MongoDB. It allows users to upload videos, tweet-like posts, and interact with other users.

## Tech Stack
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **API Testing**: Postman  
- **Authentication**: JWT (Access Token & Refresh Token)  
- **Cloud Storage**: Cloudinary  

## Features
- User authentication (Login/Signup with Access & Refresh Tokens)  
- Upload videos  
- Post tweets  
- View subscriber count and subscribed channels  
- Like, comment, and share functionality  
- User profile management  

## Installation
### Prerequisites
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/)  
- [MongoDB](https://www.mongodb.com/)  

### Steps to Run the Project
1. **Clone the repository**
   ```sh
   git clone https://github.com/Samiddha024/videotube.git
   cd BACKEND PROJECT
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=*

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the Server**
   ```sh
   npm start
   ```

## Schema Writing
This project includes well-structured schema definitions for users, videos, and tweets, ensuring data consistency and validation.
