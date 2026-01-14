# Offer Letter Backend - Complete Project Architecture

## 📋 Project Overview

A comprehensive **Multi-Tenant HR Portal Backend** for generating customized offer letters with support for multiple organizations, industries, and company types. Built with Node.js, Express, and MongoDB.

## 🏗️ Project Structure

```
offerLetterBackend/
├── server.js                 # Main entry point
├── package.json             # Dependencies & scripts
├── seed.js                  # Database seeding script
├── SEED_README.md          # Seeding documentation
├── test-company-setup.js   # Company setup testing
│
├── middleware/
│   └── authMiddleware.js   # JWT authentication & role-based access control
│
├── utils/
│   ├── apiResponse.js      # Standardized API response helpers
│   └── sendMail.js         # Email service utilities
│
├── uploads/                # File storage directory
│   ├── pdfs/              # Generated offer letter PDFs
│   ├── logos/             # Company logos
│   ├── documents/         # Supporting documents
│   ├── attachments/       # Email attachments
│   └── temp/              # Temporary files
│
├── reports/               # Analytics & reporting outputs
│
└── src/                   # Main source code
    ├── superAdmin/       # SuperAdmin module
    ├── admin/            # Admin module
    ├── user/             # User module
    └── organisation/     # Organisation module
```

## 🎭 User Roles & Hierarchy

```
SuperAdmin (Top Level)
    ├── Manages multiple organisations
    ├── Creates and manages Admins
    └── Full system access
    
Admin (Organisation Level)
    ├── Belongs to one organisation
    ├── Manages Users within their org
    └── Organisation-wide permissions
    
User (Employee Level)
    ├── Belongs to one organisation
    ├── Creates templates and offers
    └── Limited to their organisation
```

## 📦 Core Modules

### 1. SuperAdmin Module (`src/superAdmin/`)

**Purpose:** System-wide administration and organisation management

**Models:**
- `superadmin.js` - SuperAdmin user model with OTP verification

**Controllers:**
- `authController.js` - Registration, login, OTP verification, password reset
- `organisationController.js` - CRUD operations for organisations
- `adminController.js` - Admin management within organisations

**Routes:**
- `/api/superAdmin/auth` - Authentication endpoints
- `/api/superAdmin/org` - Organisation management
- `/api/superAdmin/admin` - Admin management

**Key Features:**
- Email-based OTP verification system
- Password reset functionality
- Organisation onboarding and payment tracking
- Admin creation and management across orgs

---

### 2. Admin Module (`src/admin/`)

**Purpose:** Organisation-level administration

**Models:**
- `admin.js` - Admin user model linked to organisation

**Controllers:**
- `authController.js` - Admin login and authentication
- `userController.js` - User management within organisation

**Routes:**
- `/api/admin/auth` - Admin authentication
- `/api/admin/users` - User CRUD operations

**Key Features:**
- Organisation-scoped user management
- User creation and status management
- Role-based access control

---

### 3. Organisation Module (`src/organisation/`)

**Purpose:** Multi-tenant organisation management

**Models:**
- `organisation.js` - Organisation/Company entity

**Schema:**
```javascript
{
  organisationName: String (unique),
  onboardDate: Date,
  paymentStatus: ['Paid', 'Unpaid', 'Pending'],
  organisationId: String (unique)
}
```

---

### 4. User Module (`src/user/`) ⭐ Core Business Logic

**Purpose:** End-user functionality for offer letter generation

#### **Models:**

1. **`user.js`** - User/Employee model
   - Organisation-linked users
   - Status management (active/inactive)
   - Analytics methods for user statistics

2. **`company.js`** - Company profile management (285+ lines)
   - **Comprehensive company profiles** with industry, type, size
   - **Address & contact information**
   - **Business details** (PAN, GST, TAN, CIN numbers)
   - **Branding** (logo, colors, fonts, custom CSS)
   - **Salary structure defaults** (HRA, PF, ESIC, allowances)
   - **Employment terms** (probation, notice, working hours)
   - **Benefits & perks** (insurance, equity, allowances)
   - **Company policies** (leave, work, performance)
   - **Multi-location & currency support**

3. **`template.js`** - Offer letter templates (506 lines)
   - **Rich content sections** with conditional rendering
   - **Dynamic placeholders** with validation
   - **Company branding integration**
   - **Industry & company type categorization**
   - **Version control system**
   - **Multi-industry support** (IT, Manufacturing, Healthcare, etc.)
   - **Compliance standards tracking**
   - **Advanced styling & formatting options**

4. **`generatedOffer.js`** - Generated offer instances (340 lines)
   - **Complete salary breakdown** (annual & monthly)
   - **Candidate data** with validation
   - **Company-specific branding**
   - **Status tracking** (draft, sent, accepted, rejected)
   - **Email communication logs**
   - **Analytics tracking** (views, downloads)
   - **Expiration management**

#### **Controllers:**

- `authController.js` - User authentication
- `templateController.js` - Template CRUD & management
- `offerController.js` - Offer generation & management
- `companyController.js` - Company profile management
- `universalCompanyController.js` - Universal company support
- `analyticsController.js` - Business analytics & reporting

#### **Services:** (Core Business Logic)

1. **`enhancedTemplateEngine.js`** - Universal offer generation
   - Multi-company template rendering
   - Industry-specific customization
   - Placeholder resolution
   - Conditional section rendering

2. **`pdfGenerator.js`** - PDF creation with Puppeteer
   - Professional PDF generation
   - Company branding integration
   - Multi-page support
   - Header/footer customization

3. **`salaryCalculator.js`** - Comprehensive salary calculations
   - CTC breakdown (Basic, HRA, Allowances)
   - Statutory deductions (PF, ESIC, PT)
   - Employer contributions (Gratuity, Insurance)
   - Location-based calculations

4. **`emailService.js`** - Email functionality
   - Offer letter email delivery
   - Attachment support
   - Template-based emails

5. **`analyticsService.js`** - Business intelligence
   - Offer statistics and trends
   - Template usage analytics
   - User activity tracking

6. **`reportingService.js`** - Report generation
   - Excel/CSV exports
   - Custom report builders

7. **`searchService.js`** - Advanced search
   - Full-text search capabilities
   - Filter and sort operations

8. **`companyOfferService.js`** - Company-specific logic
   - Company-branded offer generation

9. **`fileUploadService.js`** - File handling
   - Logo uploads
   - Document management

#### **Routes:**

```
/api/user/auth              - Authentication
/api/user/templates         - Template management
/api/user/offers            - Offer letter operations
/api/user/company           - Company profiles
/api/user/universal         - Universal company operations
/api/user/upload            - File uploads
/api/user/analytics         - Analytics endpoints
```

#### **Middleware:**

- `offerValidation.js` - Offer data validation
- `templateValidation.js` - Template content validation

#### **Sample Data:**

- `sampleTemplate.js` - Pre-built template examples
- `universalCompanySamples.js` - Sample company configurations

---

## 🔐 Authentication & Authorization

### Authentication Middleware (`middleware/authMiddleware.js`)

**Flow:**
1. Extract JWT from `Authorization: Bearer <token>` header
2. Verify token signature using `JWT_SECRET`
3. Decode user ID and role from token
4. Load user from appropriate model (Superadmin/Admin/User)
5. Check role against allowed roles array
6. Attach user object to `req.user`

**Usage Example:**
```javascript
router.get('/profile', 
  authMiddleware(['Superadmin']), 
  getProfile
);

router.post('/offers', 
  authMiddleware(['User', 'Admin']), 
  createOffer
);
```

**Error Handling:**
- Token expired: 401
- Invalid token: 401
- User not found: 404
- Insufficient permissions: 403

---

## 📡 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 💾 Database Models Summary

| Model | Collections | Key Features |
|-------|-------------|--------------|
| **Superadmin** | superadmins | OTP verification, email verification |
| **Organisation** | organisations | Payment status, unique org ID |
| **Admin** | admins | Organisation-linked, status management |
| **User** | users | Organisation-linked, analytics methods |
| **Company** | companies | Comprehensive profiles, branding, policies |
| **Template** | templates | Versioning, conditional sections, placeholders |
| **GeneratedOffer** | generatedoffers | Status tracking, analytics, email logs |

---

## 🎨 Key Features

### 1. Multi-Tenant Architecture
- Organisation-based data isolation
- Shared templates with org-specific customization
- Cross-org admin management by SuperAdmin

### 2. Universal Company Support
- **11 Industry types** (IT, Manufacturing, Healthcare, Finance, etc.)
- **6 Company types** (Startup, Corporate, Consulting, etc.)
- **Industry-specific benefits** and policies
- **Location-based compliance** (India, US, UK, Singapore)
- **Multi-currency support** (INR, USD, GBP, SGD)

### 3. Advanced Template System
- **Rich text editor** support
- **Dynamic placeholders** with validation
- **Conditional sections** based on designation, department
- **Company branding** integration (logo, colors, fonts)
- **Version control** with history tracking
- **Template categorization** (Standard, Executive, Contract, Internship)

### 4. Comprehensive Salary Calculator
- **Component breakdown**: Basic, HRA, Special Allowance, Statutory Bonus
- **Deductions**: PF (12%), ESIC (3.25%), Professional Tax
- **Employer costs**: Gratuity, Insurance, Employer PF
- **Multiple salary types**: CTC, Gross, Take-home
- **Customizable percentages** per company

### 5. Professional PDF Generation
- **Puppeteer-based** rendering
- **Company branding** applied automatically
- **Multi-page** support with headers/footers
- **Print-ready** formatting
- **A4 format** with proper margins

### 6. Business Analytics
- **Offer statistics**: Total, accepted, rejected, pending
- **Template usage**: Most used, conversion rates
- **Salary trends**: Average CTC, designation-wise
- **User activity**: Creation patterns, growth trends
- **Time-based filtering**: Daily, weekly, monthly

### 7. Email Integration
- **Automated offer delivery**
- **Reminder system**
- **Attachment support** (PDFs, documents)
- **Email tracking** (sent, opened, bounced)
- **Custom email templates**

### 8. File Management
- **Logo uploads** with image optimization
- **Document attachments**
- **PDF storage** and retrieval
- **Temporary file cleanup**

---

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/offerLetterDB

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=3000
NODE_ENV=development

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads
```

---

## 🚀 API Endpoints Overview

### SuperAdmin Routes (`/api/superAdmin`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/register` | Register new superadmin | No |
| POST | `/auth/verify-otp` | Verify registration OTP | No |
| POST | `/auth/login` | SuperAdmin login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with OTP | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| GET | `/auth/profile` | Get superadmin profile | Yes (Superadmin) |
| POST | `/org` | Create organisation | Yes (Superadmin) |
| GET | `/org` | List all organisations | Yes (Superadmin) |
| GET | `/org/:id` | Get organisation details | Yes (Superadmin) |
| PUT | `/org/:id` | Update organisation | Yes (Superadmin) |
| DELETE | `/org/:id` | Delete organisation | Yes (Superadmin) |
| POST | `/admin/admins` | Create admin | Yes (Superadmin) |
| GET | `/admin/admins` | List all admins | Yes (Superadmin) |
| GET | `/admin/org/:orgId/admins` | Get admins by org | Yes (Superadmin) |
| PUT | `/admin/admins/:id` | Update admin | Yes (Superadmin) |
| DELETE | `/admin/admins/:id` | Delete admin | Yes (Superadmin) |
| PATCH | `/admin/toggleAdminStatus/:id` | Toggle admin status | Yes (Superadmin) |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/login` | Admin login | No |
| POST | `/auth/forgot-password` | Password reset request | No |
| GET | `/users` | List users in org | Yes (Admin) |
| POST | `/users` | Create new user | Yes (Admin) |
| GET | `/users/:id` | Get user details | Yes (Admin) |
| PUT | `/users/:id` | Update user | Yes (Admin) |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |
| PATCH | `/users/:id/status` | Toggle user status | Yes (Admin) |

### User Routes (`/api/user`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| GET | `/auth/profile` | Get user profile | Yes (User) |
| GET | `/templates` | List templates | Yes (User) |
| POST | `/templates` | Create template | Yes (User) |
| GET | `/templates/:id` | Get template | Yes (User) |
| PUT | `/templates/:id` | Update template | Yes (User) |
| DELETE | `/templates/:id` | Delete template | Yes (User) |
| POST | `/templates/:id/duplicate` | Duplicate template | Yes (User) |
| GET | `/offers` | List offers | Yes (User) |
| POST | `/offers` | Generate offer | Yes (User) |
| GET | `/offers/:id` | Get offer details | Yes (User) |
| PUT | `/offers/:id` | Update offer | Yes (User) |
| DELETE | `/offers/:id` | Delete offer | Yes (User) |
| POST | `/offers/:id/send` | Email offer to candidate | Yes (User) |
| GET | `/offers/:id/pdf` | Download offer PDF | Yes (User) |
| GET | `/company` | List companies | Yes (User) |
| POST | `/company` | Create company profile | Yes (User) |
| PUT | `/company/:id` | Update company | Yes (User) |
| GET | `/universal/companies` | Universal company search | Yes (User) |
| POST | `/upload/logo` | Upload company logo | Yes (User) |
| POST | `/upload/document` | Upload document | Yes (User) |
| GET | `/analytics/dashboard` | Dashboard analytics | Yes (User) |
| GET | `/analytics/offers` | Offer analytics | Yes (User) |
| GET | `/analytics/templates` | Template analytics | Yes (User) |

---

## 📊 Analytics Capabilities

### Offer Analytics
- Total offers generated
- Acceptance rate
- Average offer value (CTC)
- Status distribution (draft, sent, accepted, rejected)
- Daily/weekly/monthly trends
- Top designations with average salaries
- Time-to-acceptance metrics

### Template Analytics
- Template usage frequency
- Most popular templates
- Category performance
- Conversion rates per template
- Last used timestamps

### User Analytics
- User growth trends
- Active vs inactive users
- Role distribution
- Activity patterns

### Company Analytics
- Companies by industry
- Companies by type
- Verification status distribution
- Compliance tracking

---

## 🗄️ Database Seeding

### Seed Data (`npm run seed`)

**Creates:**
- 1 SuperAdmin (superadmin@example.com)
- 3 Organisations (TechCorp, StartupHub, ManufacturingPlus)
- 3 Admins (one per organisation)
- 4 Users across organisations
- 2 Company profiles with full configurations
- 2 Templates (IT Corporate, Startup)
- 2 Sample offers

**Credentials:**
```
SuperAdmin: superadmin@example.com / superadmin123
Admins: admin@{orgname}.com / admin123
Users: user1@{orgname}.com / user123
```

---

## 🛡️ Security Features

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **JWT Tokens**: Signed with secret, 1-day expiration
3. **Role-Based Access Control**: Middleware-enforced
4. **OTP Verification**: Email-based for sensitive operations
5. **Input Validation**: express-validator middleware
6. **CORS Configuration**: Restricted origins
7. **Rate Limiting**: (Recommended to add)
8. **SQL Injection Prevention**: MongoDB native protection

---

## 📈 Performance Optimizations

1. **Database Indexes**:
   - Organisation + isActive on templates
   - Email uniqueness on all user models
   - Text search on template names
   - Compound indexes on analytics queries

2. **Pagination**: Implemented on list endpoints

3. **Lazy Loading**: Referenced documents loaded on demand

4. **Caching**: (Recommended to implement Redis)

5. **File Optimization**:
   - Image compression with Sharp
   - PDF generation in background (recommended)

---

## 🧪 Testing

### Test Script
- `test-company-setup.js` - Company profile testing

### Recommended Tests
- Unit tests for salary calculator
- Integration tests for API endpoints
- E2E tests for offer generation flow
- Load testing for PDF generation

---

## 🚦 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configurations
```

### Database Setup
```bash
npm run seed
```

### Start Server
```bash
# Development with auto-reload
npm start

# Production
npm run start:prod
```

### Server runs on
```
http://localhost:3000
```

---

## 📁 File Structure Details

```
uploads/
├── pdfs/           # Generated offer letter PDFs
│   └── offer-{name}-{timestamp}.pdf
├── logos/          # Company logos (PNG, JPG, SVG)
├── documents/      # Supporting documents
├── attachments/    # Email attachments
└── temp/           # Temporary processing files

reports/            # Analytics exports (Excel, CSV)
```

---

## 🔄 Data Flow

### Offer Generation Flow
```
1. User creates/selects Template
2. User selects Company Profile
3. User enters Candidate Data
4. System validates inputs
5. Salary Calculator computes breakdown
6. Template Engine renders content with placeholders
7. PDF Generator creates professional PDF
8. Generated Offer saved to database
9. PDF file saved to uploads/pdfs/
10. Email service sends to candidate (optional)
11. Analytics updated
```

### Template Rendering Flow
```
1. Load template from database
2. Check company compatibility
3. Apply company branding (colors, logo, fonts)
4. Resolve placeholders with candidate/company data
5. Evaluate conditional sections
6. Apply styling and formatting
7. Generate HTML content
8. Convert to PDF via Puppeteer
9. Return PDF buffer and HTML
```

---

## 🌐 CORS Configuration

```javascript
cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Local testing
    'http://127.0.0.1:5173'   // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
})
```

---

## 📝 Important Notes

### Business Logic
- **Organisation is the top-level entity** - all data is scoped to organisations
- **Companies are separate from Organisations** - Companies are client profiles within an org
- **Templates can be industry-specific or universal**
- **Salary calculations follow Indian statutory requirements** by default
- **PDF generation is synchronous** - consider making async for production

### Data Relationships
```
Organisation (1) ─┬─> (N) Admins
                  ├─> (N) Users
                  ├─> (N) Companies
                  ├─> (N) Templates
                  └─> (N) GeneratedOffers

Template (1) ──> (N) GeneratedOffers
Company (1) ──> (N) GeneratedOffers
User (1) ──> (N) Templates
User (1) ──> (N) GeneratedOffers
```

### Validation Rules
- Emails must be unique across each user type
- Organisation names must be unique
- PAN, GST numbers validated with regex
- Salary components must sum correctly
- Template placeholders must be defined before use

---

## 🆕 Recent Enhancements

1. **Universal Company Support** - Any industry, any type
2. **Enhanced Branding System** - Full customization
3. **Advanced Analytics** - Comprehensive business intelligence
4. **Conditional Templating** - Dynamic content rendering
5. **Multi-currency Support** - Global operations
6. **Compliance Tracking** - Industry standards monitoring

---

## 🔮 Future Enhancements (Recommended)

1. **Background Job Processing** - Bull/Agenda for PDF generation
2. **Redis Caching** - Template and company data caching
3. **Rate Limiting** - express-rate-limit middleware
4. **API Documentation** - Swagger/OpenAPI
5. **Unit Tests** - Jest test suite
6. **Logging System** - Winston or Pino
7. **Docker Support** - Containerization
8. **CI/CD Pipeline** - Automated testing and deployment
9. **Webhook Support** - Offer status notifications
10. **E-signature Integration** - DocuSign/HelloSign

---

## 📞 Support & Maintenance

### Common Issues

1. **PDF Generation Slow**: Implement background jobs
2. **Large File Uploads**: Increase nginx/express limits
3. **Token Expiration**: Implement refresh token mechanism
4. **Email Delivery**: Check SMTP credentials and firewall

### Monitoring Points

- Database connection pool status
- PDF generation queue length
- API response times
- Email delivery rates
- Disk space (uploads folder)
- Memory usage during PDF generation

---

## 🎯 Key Takeaways

This is a **production-ready, enterprise-grade backend** with:

✅ **Multi-tenant architecture**
✅ **Role-based access control** (3 levels)
✅ **Universal company support** (11+ industries)
✅ **Advanced template system** with versioning
✅ **Professional PDF generation**
✅ **Comprehensive analytics**
✅ **Email integration**
✅ **Proper authentication & authorization**
✅ **Clean code structure**
✅ **Scalable design**

---

**Last Updated:** January 2025
**Total Lines of Code:** ~15,000+
**Models:** 7 core models
**API Endpoints:** 50+ endpoints
**Services:** 9 specialized services

---

## 📚 Related Documentation

- [SEED_README.md](./SEED_README.md) - Database seeding guide
- [src/user/README.md](./src/user/README.md) - User module details
- [package.json](./package.json) - Dependencies and scripts

---

**Built with ❤️ for comprehensive HR management**

