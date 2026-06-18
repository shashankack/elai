# ELAI Vendor Portal

A comprehensive vendor registration and KYC verification portal built with Next.js, TypeScript, and Prisma.

## Features

### 🏠 Landing Page
- Value proposition showcase
- 3-step eligibility quiz
- Progress indicators
- Responsive design

### 📝 Multi-Step Registration
- 5-step onboarding process:
  1. Business Information
  2. Document Upload (KYC)
  3. Financial Setup
  4. Shipping & Logistics
  5. Storefront Quick Setup

### 📄 Document Management
- Secure file upload to AWS S3
- Support for PDF, JPG, PNG formats
- Pre-signed URLs for secure uploads
- Document metadata tracking

### 📊 Admin Dashboard
- Real-time application review queue
- Document preview functionality
- Approve/Reject/Request Info actions
- Audit trail and review history
- Application statistics

### 🔐 Authentication & Security
- NextAuth.js integration
- Role-based access control
- Admin-only route protection
- Session management

### 📧 Email Notifications
- Application submission confirmations
- Approval/rejection notifications
- Information requests
- Beautiful HTML email templates

### 🗄️ Database Schema
- PostgreSQL with Prisma ORM
- KYC application tracking
- Review history and audit logs
- User management

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Authentication**: NextAuth.js
- **Email**: Nodemailer with SMTP

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file storage)
- SMTP server (for emails)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd elai-vendor-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: S3 credentials
- `SMTP_*`: Email server configuration
- `NEXTAUTH_SECRET`: Authentication secret

## API Endpoints

### User-Facing
- `POST /api/kyc/submit` - Submit KYC application
- `GET /api/kyc/status` - Check application status
- `POST /api/kyc/upload/request` - Get upload URL
- `POST /api/kyc/upload/confirm` - Confirm file upload

### Admin-Facing
- `GET /api/admin/kyc/pending` - List pending applications
- `GET /api/admin/kyc/[id]` - Get application details
- `POST /api/admin/kyc/[id]` - Approve/reject application

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── auth/          # Authentication
│   │   └── kyc/           # KYC-related APIs
│   ├── register/          # Registration flow
│   ├── status/            # Status page
│   └── thank-you/         # Confirmation page
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── email.ts          # Email service
│   └── prisma.ts         # Prisma client
└── prisma/               # Database schema and migrations
```

## Database Schema

The application uses the following main entities:
- `User`: User accounts and authentication
- `KYCApplication`: Vendor applications and status
- `KYCReviewHistory`: Audit trail for reviews
- `AdminUser`: Admin account management

## User Flow

1. **Eligibility Check**: 3-question quiz determines if user fits criteria
2. **Registration**: 5-step form collects business info and documents
3. **Submission**: Documents uploaded to S3, application saved to database
4. **Review**: Admin reviews application in dashboard
5. **Decision**: Application approved, rejected, or requires more info
6. **Notification**: Email sent to user with decision

## Admin Flow

1. **Dashboard**: View application statistics and queue
2. **Review**: Examine documents and business details
3. **Decision**: Approve, reject, or request additional info
4. **Audit**: All actions logged to review history

## Security Features

- Pre-signed S3 URLs for secure uploads
- Role-based access control
- Input validation and sanitization
- CSRF protection via NextAuth
- Environment variable configuration

## Development

### Running Tests
```bash
npm run test
```

### Database Management
```bash
npx prisma studio      # View database
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate client
```

### Code Style
- ESLint for linting
- TypeScript for type safety
- Tailwind for styling
- Consistent file naming

## Deployment

### Environment Setup
1. Configure production database
2. Set up AWS S3 bucket with proper permissions
3. Configure SMTP service
4. Set up authentication providers
5. Generate and set secrets

### Build Process
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
