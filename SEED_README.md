# Database Seed File

This seed file populates the database with comprehensive demo data for testing and development purposes.

## What it creates:

### 1. **Superadmin**
- **Email**: `superadmin@example.com`
- **Password**: `superadmin123`
- **Role**: Superadmin
- **Status**: Email verified

### 2. **Organisations (3)**
- **TechCorp Solutions** - IT Corporate company
- **StartupHub Innovations** - IT Startup company  
- **Manufacturing Plus Ltd** - Manufacturing company

### 3. **Admins (3)**
- **admin@techcorp.com** / `admin123` - Admin for TechCorp
- **admin@startuphub.com** / `admin123` - Admin for StartupHub
- **admin@manufacturingplus.com** / `admin123` - Admin for ManufacturingPlus

### 4. **Users (4)**
- **user1@techcorp.com** / `user123` - User for TechCorp
- **user2@techcorp.com** / `user123` - User for TechCorp
- **user1@startuphub.com** / `user123` - User for StartupHub
- **user1@manufacturingplus.com** / `user123` - User for ManufacturingPlus

### 5. **Companies (2)**
- **TechCorp Solutions** - Full company profile with corporate benefits
- **StartupHub Innovations** - Startup company with ESOPs and flexible policies

### 6. **Templates (2)**
- **Standard IT Offer Letter** - Corporate template for TechCorp
- **Startup Offer Letter** - Modern template for StartupHub

### 7. **Generated Offers (2)**
- **John Doe** - Software Engineer offer at TechCorp
- **Jane Smith** - Full Stack Developer offer at StartupHub

## Features of the Demo Data:

### Company Types & Industries:
- **IT Corporate**: Traditional benefits, structured policies
- **IT Startup**: ESOPs, flexible hours, modern culture
- **Manufacturing**: Safety equipment, transport allowance

### Salary Structures:
- Complete salary breakdowns with HRA, allowances, bonuses
- PF, ESIC, gratuity calculations
- Professional tax considerations

### Branding:
- Company logos using dummy image URLs as requested
- Color schemes and typography
- Header and footer styles

### Compliance & Documents:
- ISO certifications
- Required document lists
- Industry-specific requirements

## How to Run:

### Prerequisites:
1. MongoDB running locally or set `MONGODB_URI` in `.env`
2. Node.js and npm installed
3. Dependencies installed (`npm install`)

### Run the Seed:
```bash
# Using npm script
npm run seed

# Or directly with node
node seed.js
```

### Environment Variables:
Create a `.env` file in the backend root:
```env
MONGODB_URI=mongodb://localhost:27017/offerLetterDB
```

## What Happens:
1. Connects to MongoDB
2. Clears all existing data
3. Creates data in the correct order (respecting foreign key relationships)
4. Displays progress and summary
5. Closes database connection

## Demo Credentials Summary:
```
Superadmin: superadmin@example.com / superadmin123
Admin (TechCorp): admin@techcorp.com / admin123
Admin (StartupHub): admin@startuphub.com / admin123
Admin (ManufacturingPlus): admin@manufacturingplus.com / admin123
User (TechCorp): user1@techcorp.com / user123
User (StartupHub): user1@startuphub.com / user123
User (ManufacturingPlus): user1@manufacturingplus.com / user123
```

## Notes:
- All passwords are hashed using bcrypt
- Image URLs use the requested dummy image service
- Data is realistic and follows business logic
- Foreign key relationships are properly maintained
- The seed can be run multiple times safely

## Troubleshooting:
- Ensure MongoDB is running
- Check database connection string
- Verify all dependencies are installed
- Check console output for specific errors
