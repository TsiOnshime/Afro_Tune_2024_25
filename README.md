# Afro_Tune_2024_25
 
 Name             |      ID
----------------- | -------------
Selamawit Shimeles| UGR/8982/15
Tsion Shimelis    | UGR/0654/15
Yadeni Lemma      | UGR/0174/15
Yedi Worku        | UGR/1035/15
Yordanos Abay     | UGR/0919/15



 
# AfroTuneNest Backend 
 
This repository contains the backend API for AfroTuneNest, a music player website with role-based functionality for Super Admins, Artists, and Normal Users. 
 
--- 
 
## Features 
 
### Roles and Responsibilities: 
 
1. Super Admin:   
   - Email: yediworku@gmail.com   
   - Password: pass   
   - Responsibilities:   
     - Log in as the Super Admin.   
     - Register new artists.   
     - Manage artists and user data. 
 
2. Artist:   
   - Responsibilities:   
     - Upload songs to the platform.   
     - Update their profiles. 
 
3. Normal User:   
   - Responsibilities:   
     - Listen to music uploaded by artists. 
 
### Core Functionalities: 
- Authentication:   
  Role-based login for Super Admin, Artists, and Normal Users. 
- Artist Management:   
  Super Admin can register artists.   
  Artists can manage their profiles.   
- Music Upload & Streaming:   
  Artists can upload songs.   
  Normal users can listen to the uploaded music. 
- Swagger API Documentation:   
  Available at: http://localhost:3006/api#/ 
 
--- 
 
## Installation 
 
### Prerequisites: 
- Node.js (>=14.x) 
- MongoDB (Ensure MongoDB is running locally or remotely) 
 
--- 
 
### Steps to Run the Project: 
 
1. Clone the Repository: 
   bash 
   git clone <https://github.com/TsiOnshime/Afro_Tune_2024_25.git> 
   cd afrotunes 
    
 
2. Install Dependencies: 
   bash 
   npm install 
    
 
3. Set Up Environment Variables: 
   Create a .env file in the root of the project and add the following variables: 
   env 
   PORT=3006 
   MONGO_URI=mongodb://localhost:27017/afrotune 
   JWT_SECRET=your_jwt_secret 
    
 
4. Start the Server: 
   bash 
   npm start run:dev 
    
   The server will start at http://localhost:3006. 
 
5. Access Swagger API Documentation: 
   Visit http://localhost:3006/api#/ to explore the API endpoints. 
 
--- 
 
## Usage Instructions 
 
### Super Admin: 
1. Log in using the credentials:
   login as a super admin using this email and password
   - Email: yediworku@gmail.com 
   - Password: pass 
2. Use the Swagger API to register new artists or the user inteface on the frontend. 
 
### Artist: 
1. Log in with your credentials after being registered by the Super Admin. 
2. Upload songs and update your profile. 
 
### Normal User: 
1. Register or log in as a normal user. 
2. Browse and listen to songs uploaded by artists. 
 
--- 
 
## Technologies Used 
 
- Backend Framework: NestJS 
- Database: MongoDB 
- Authentication: JSON Web Tokens (JWT) 
- API Documentation: Swagger
