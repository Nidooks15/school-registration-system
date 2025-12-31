# Online School Registration System

A comprehensive full-stack web application for managing school registrations with payment processing, document uploads, and role-based dashboards.

## 🚀 Features

### Public Features

- **Landing Page**: School information, programs, tuition, and registration steps
- **Student Registration**: Multi-step form with personal info, parent/guardian details, and academic information
- **Secure Authentication**: JWT-based login for students and admins

### Student Dashboard

- View registration status and personal information
- Upload required documents (birth certificate, report card, ID photo)
- Make payments online with Stripe integration
- View payment history and download receipts
- Update personal information

### Admin Dashboard

- View statistics and recent registrations
- Search and filter student registrations
- Review uploaded documents
- Approve/reject registrations
- Update enrollment status
- View payment history and reports

### Payment System

- Stripe integration for online payments
- Registration fee and tuition down-payment options
- Payment status tracking (Pending, Paid, Failed)
- Auto-generated PDF receipts
- Email notifications for payment confirmation

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Email**: Nodemailer
- **PDF Generation**: PDFKit

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)

You'll also need accounts for:

- **Cloudinary** (for file storage)
- **Stripe** (for payments)
- **Gmail** (for email notifications)

## 🔧 Installation

### 1. Clone the Repository

```bash
cd /Users/angelmerpioquinto/Desktop/School/school-registration-system
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, JWT_SECRET, CLOUDINARY_*, STRIPE_*, EMAIL_*

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your API URL and Stripe key
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school_registration"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="School Registration <noreply@school.com>"

# Server
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

## 📊 Database Schema

The application uses the following main tables:

- **users**: User accounts (students and admins)
- **students**: Student information
- **guardians**: Parent/guardian details
- **documents**: Uploaded files
- **payments**: Payment records

## 🎯 Usage

### Creating an Admin Account

Since registration creates student accounts by default, you'll need to manually create an admin account in the database:

```bash
# Access Prisma Studio
npm run prisma:studio

# Or use SQL
psql -d school_registration
INSERT INTO users (id, email, password_hash, role) VALUES
  (gen_random_uuid(), 'admin@school.com', '$2b$10$...', 'ADMIN');
```

Note: Hash the password using bcrypt before inserting.

### Student Registration Flow

1. Visit the landing page
2. Click "Register Now"
3. Fill out the multi-step registration form
4. Login with your credentials
5. Upload required documents
6. Make payment
7. Wait for admin approval

### Admin Workflow

1. Login with admin credentials
2. View dashboard statistics
3. Review pending registrations
4. Check uploaded documents
5. Approve or reject registrations
6. Monitor payments

## 📁 Project Structure

```
school-registration-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── students.js            # Student management
│   ├── documents.js           # File uploads
│   └── payments.js            # Payment processing
├── middleware/
│   ├── auth.js                # JWT authentication
│   └── upload.js              # File upload config
├── utils/
│   ├── cloudinary.js          # File storage
│   ├── email.js               # Email notifications
│   └── pdf.js                 # Receipt generation
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration
│   │   ├── student/           # Student dashboard
│   │   └── admin/             # Admin dashboard
│   ├── components/            # Reusable components
│   ├── context/               # Auth context
│   └── lib/                   # API client
└── server.js                  # Express server
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:

- Vercel (Frontend)
- Railway/Render (Backend)
- Supabase/Neon (Database)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- File type and size validation
- CORS protection
- SQL injection prevention (Prisma)
- XSS protection

## 📧 Email Notifications

The system sends automated emails for:

- Registration confirmation
- Payment confirmation with receipt
- Enrollment approval/rejection

## 💳 Payment Integration

Stripe is integrated for:

- Registration fees
- Tuition down payments
- Secure card processing
- Automatic receipt generation

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
```

### Prisma Issues

```bash
# Reset database
npm run prisma:migrate reset

# Regenerate client
npm run prisma:generate
```

### File Upload Issues

- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure allowed file types (PDF, JPG, PNG)

## 📝 API Documentation

### Authentication

- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students

- `GET /api/students` - List all students (admin)
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student info
- `PUT /api/students/:id/status` - Update enrollment status (admin)

### Documents

- `POST /api/documents/upload` - Upload document
- `GET /api/documents/student/:studentId` - Get student documents
- `DELETE /api/documents/:id` - Delete document

### Payments

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/student/:studentId` - Get payment history
- `GET /api/payments/:id/receipt` - Download receipt
- `GET /api/payments` - List all payments (admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your school or organization.

## 👥 Support

For issues or questions:

- Create an issue on GitHub
- Email: support@school.com

## 🎓 Credits

Built with modern web technologies for educational institutions.
