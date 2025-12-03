<div align="center">
  <img src="frontend/public/logo512.png" alt="TUA Marketplace Logo" width="200"/>
  
  # TUA Marketplace - University Marketplace Platform
  
  TUA Marketplace is a full-stack web application designed as a marketplace platform for university students to buy, sell, and trade items within their campus community. The platform features user authentication, item listings, admin management, rating systems, and real-time notifications.
</div>

## 🚀 Features

### User Features
- **Authentication System**
  - Email/Password registration and login
  - Google OAuth integration
  - OTP-based password reset
  - User profile management

- **Marketplace**
  - Browse and search items
  - Filter by category, college, and price
  - View item details with image galleries
  - Like/favorite items
  - Contact sellers directly
  - Rate and review sellers
  - Track item views and popularity

- **User Dashboard**
  - Manage personal listings
  - View liked items
  - Update profile information
  - Upload profile pictures

### Admin Features
- **Registration Management**
  - Review pending user registrations
  - Approve or reject registrations with reasons
  - View approved and rejected registrations
  - School ID verification

- **Item Management**
  - Review and approve pending item listings
  - Archive or delete inappropriate items
  - Restore archived items
  - Permanent deletion of items

- **User Management**
  - View all registered users
  - Ban/unban users
  - Delete user accounts
  - View user activity logs

- **Analytics Dashboard**
  - Total users, items, and registrations statistics
  - Historical data tracking
  - College-wise statistics
  - Category-wise item distribution
  - User ratings overview

- **Reports & Moderation**
  - Handle user and item reports
  - View unified audit logs
  - Track admin actions

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **UI Libraries**: 
  - Material-UI (MUI) for components
  - Lucide React & React Icons for icons
  - SweetAlert2 for alerts and modals
- **Routing**: React Router DOM
- **Styling**: CSS with styled-components
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Other**: 
  - React Dropzone for file uploads
  - React-to-Print for printing functionality

### Backend
- **Language**: PHP 8.2
- **Server**: Apache (via Docker)
- **Database**: MySQL (Cloud SQL)
- **Authentication**: Session-based with Firebase Admin SDK
- **Dependencies**: 
  - PHPDotenv for environment variables
  - PHPMailer for email notifications
- **Deployment**: Google Cloud Run
- **Container**: Docker (linux/amd64)

### Infrastructure
- **Cloud Platform**: Google Cloud Platform (GCP)
  - Cloud Run for backend hosting
  - Cloud SQL for database
  - Artifact Registry for Docker images
- **Region**: asia-southeast1
- **Database Instance**: tuamar-caps2526

## 📁 Project Structure

```
tuamar/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   │   ├── adminFolder/ # Admin-specific pages
│   │   │   └── ...          # User-facing pages
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables (not in git)
│   ├── package.json         # Dependencies
│   └── firebase.json        # Firebase configuration
│
└── backend/                 # PHP backend API
    ├── ai-recomm/           # AI recommendation system
    ├── phpmailer/           # Email functionality
    ├── vendor/              # Composer dependencies
    ├── *.php                # API endpoints
    ├── .env                 # Environment variables (not in git)
    ├── .gitignore           # Git ignore rules
    ├── Dockerfile           # Docker configuration
    └── composer.json        # PHP dependencies
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PHP 8.2
- Composer
- Docker
- Google Cloud SDK (for deployment)
- Firebase account
- MySQL database

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
REACT_APP_LAPTOP_IP=your_backend_url
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:
```bash
npm start
```

5. Build for production:
```bash
npm run build
```

6. Deploy to Firebase:
```bash
firebase deploy
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create a `.env` file with your database credentials:
```env
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

4. Place your Firebase Admin SDK JSON file in the backend directory:
```
tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json
```

5. Build the Docker image:
```bash
docker buildx build --platform=linux/amd64 -t tuamarket-php . --load
```

6. Tag the image for Google Artifact Registry:
```bash
docker tag tuamarket-php asia-southeast1-docker.pkg.dev/tua-market/backend-repos/tuamarket-php
```

7. Push to Artifact Registry:
```bash
docker push asia-southeast1-docker.pkg.dev/tua-market/backend-repos/tuamarket-php
```

8. Deploy to Cloud Run:
```bash
gcloud run deploy php-backend \
  --image=asia-southeast1-docker.pkg.dev/tua-market/backend-repos/tuamarket-php \
  --add-cloudsql-instances=tua-market:asia-southeast1:tuamar-caps2526 \
  --platform=managed \
  --region=asia-southeast1 \
  --allow-unauthenticated \
  --port=8080
```

## 🔐 Security Notes

### Sensitive Files (Not in Git)
The following files contain sensitive information and are excluded from version control:

**Frontend:**
- `.env` - Contains Backend API links (one section for local development and another for production)

**Backend:**
- `.env` - Contains database credentials
- `tua-market-firebase-adminsdk-fbsvc-0bacb503ad.json` - Firebase Admin SDK credentials

**Important**: Never commit these files (Backend sensitive files) to your repository. They are protected by `.gitignore`.

## 📊 Database Schema

The application uses a MySQL database with the following main tables:
- `users` - User accounts and profiles
- `pending_registrations` - User registration requests
- `items` - Item listings
- `likes` - User likes/favorites
- `ratings` - Seller ratings and reviews
- `reports` - User and item reports
- `admin_logs` - Admin action tracking
- `unified_audit_logs` - Comprehensive audit trail

## 🎯 API Endpoints

### Authentication
- `POST /register.php` - User registration
- `POST /handleLogIn.php` - Email/password login
- `POST /handleGoogleLogIn.php` - Google OAuth login
- `POST /logOut.php` - User logout
- `POST /generateOTP.php` - Generate password reset OTP
- `POST /verifyOTP.php` - Verify OTP
- `POST /resetPassword.php` - Reset password

### Items
- `GET /browseItems.php` - Browse all items
- `GET /browseItemsFiltering.php` - Filter items
- `GET /searchItem.php` - Search items
- `POST /listItem.php` - Create new listing
- `POST /updateListing.php` - Update listing
- `POST /deleteItem.php` - Delete/archive item
- `POST /restoreItem.php` - Restore archived item

### Admin
- `GET /getPendingRegistrations.php` - Get registrations by status
- `POST /approveRegistration.php` - Approve registration
- `POST /rejectRegistration.php` - Reject registration
- `GET /itemlistingsadmin.php` - Get all item listings
- `POST /approveItem.php` - Approve item listing
- `GET /fetchUnifiedAuditLogs.php` - Get audit logs

### User Management
- `GET /fetchListUsers.php` - Get all users
- `POST /deleteUser.php` - Ban user
- `POST /restoreUser.php` - Unban user
- `POST /updateUser.php` - Update user profile

### Analytics
- `GET /fetchTotalUsers.php` - Get user statistics
- `GET /fetchTotalItems.php` - Get item statistics
- `GET /getCollegeStatsByPeriod.php` - College statistics
- `GET /getItemCategoryStatsByPeriod.php` - Category statistics

## 👥 User Roles

### Regular Users
- Can register and login
- Browse and search items
- Create, edit, and delete their own listings
- Like items and contact sellers
- Rate and review sellers
- Report inappropriate content

### Administrators
- All user permissions
- Approve/reject user registrations
- Moderate item listings
- Manage users (ban/unban)
- View analytics and reports
- Access audit logs

## 🐛 Known Issues & Troubleshooting

### Registration Filter Issue (Fixed)
- **Issue**: Admin registration tabs (Approved, Rejected, All) were not displaying the correct filtered results
- **Cause**: Backend was hardcoded to only fetch PENDING registrations
- **Fix**: Updated `getPendingRegistrations.php` to properly handle status filter parameter

### Common Issues
1. **CORS Errors**: Ensure `corsHeader.php` is included in all backend endpoints
2. **Session Issues**: Check that `credentials: 'include'` is set in frontend fetch calls
3. **Database Connection**: Verify Cloud SQL instance is running and credentials are correct
4. **Image Upload**: Check file size limits in Apache and PHP configuration

## 📝 Development Workflow

1. Make changes to frontend or backend code
2. Test locally
3. For backend changes:
   - Rebuild Docker image
   - Push to Artifact Registry
   - Deploy to Cloud Run
4. For frontend changes:
   - Build production bundle
   - Deploy to Firebase Hosting

## 📄 License

This project is developed as part of a university capstone project.

## 👨‍💻 Contributors

Developed by the Tua Marketplace development team.

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Last Updated**: December 2025
