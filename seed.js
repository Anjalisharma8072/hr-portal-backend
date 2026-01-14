const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Superadmin = require('./src/superAdmin/model/superadmin');
const Organisation = require('./src/organisation/model/organisation');
const Admin = require('./src/admin/model/admin');
const User = require('./src/user/model/user');
const Company = require('./src/user/model/company');
const Template = require('./src/user/model/template');
const GeneratedOffer = require('./src/user/model/generatedOffer');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/offerLetterDB');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('Starting to seed database...');

    // Clear existing data
    await Promise.all([
      Superadmin.deleteMany({}),
      Organisation.deleteMany({}),
      Admin.deleteMany({}),
      User.deleteMany({}),
      Company.deleteMany({}),
      Template.deleteMany({}),
      GeneratedOffer.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // 1. Create Superadmin
    const superadmin = await Superadmin.create({
      email: 'superadmin@example.com',
      password: 'superadmin123',
      role: 'Superadmin',
      isEmailVerified: true
    });
    console.log('Created Superadmin:', superadmin.email);

    // 2. Create Organisations
    const organisations = await Organisation.create([
      {
        organisationName: 'TechCorp Solutions',
        onboardDate: new Date('2024-01-15'),
        paymentStatus: 'Paid',
        organisationId: 'ORG001',
        companyInfo: {
          industry: 'IT',
          companyType: 'corporate',
          employeeCount: '201-500',
          foundedYear: 2010,
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider'
        },
        branding: {
          logo: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Arial, sans-serif',
          headerStyle: 'modern',
          footerStyle: 'detailed'
        },
        offerLetterDefaults: {
          defaultSalaryStructure: {
            hraPercentage: 0.1,
            specialAllowancePercentage: 0.113,
            statutoryBonusPercentage: 0.083,
            pfPercentage: 0.12,
            esicPercentage: 0.0325,
            gratuityPercentage: 0.048
          },
          defaultTerms: {
            probationPeriod: 6,
            noticePeriod: 30,
            contractDuration: 365,
            workingHours: '9 AM - 6 PM',
            workDays: 'Monday - Friday'
          },
          defaultBenefits: [
            {
              name: 'Health Insurance',
              type: 'insurance',
              value: 'Family coverage',
              isMandatory: true,
              description: 'Comprehensive health insurance'
            },
            {
              name: 'Provident Fund',
              type: 'monetary',
              value: '12% of basic',
              isMandatory: true,
              description: 'Employee provident fund'
            }
          ]
        }
      },
      {
        organisationName: 'StartupHub Innovations',
        onboardDate: new Date('2024-02-01'),
        paymentStatus: 'Paid',
        organisationId: 'ORG002',
        companyInfo: {
          industry: 'IT',
          companyType: 'startup',
          employeeCount: '1-50',
          foundedYear: 2022,
          website: 'https://startuphub.com',
          description: 'Innovative startup in fintech'
        },
        branding: {
          logo: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg',
          primaryColor: '#10b981',
          secondaryColor: '#f59e0b',
          fontFamily: 'Inter, sans-serif',
          headerStyle: 'centered',
          footerStyle: 'minimal'
        },
        offerLetterDefaults: {
          defaultSalaryStructure: {
            hraPercentage: 0.1,
            specialAllowancePercentage: 0.113,
            statutoryBonusPercentage: 0.083,
            pfPercentage: 0.12,
            esicPercentage: 0.0325,
            gratuityPercentage: 0.048
          },
          defaultTerms: {
            probationPeriod: 3,
            noticePeriod: 15,
            contractDuration: 365,
            workingHours: '10 AM - 7 PM',
            workDays: 'Monday - Friday'
          },
          defaultBenefits: [
            {
              name: 'ESOPs',
              type: 'equity',
              value: '0.1% - 0.5%',
              isMandatory: false,
              description: 'Employee Stock Option Plan'
            },
            {
              name: 'Flexible Hours',
              type: 'non-monetary',
              value: true,
              isMandatory: false,
              description: 'Flexible working hours'
            }
          ]
        }
      },
      {
        organisationName: 'Manufacturing Plus Ltd',
        onboardDate: new Date('2024-01-20'),
        paymentStatus: 'Paid',
        organisationId: 'ORG003',
        companyInfo: {
          industry: 'Manufacturing',
          companyType: 'manufacturing',
          employeeCount: '501-1000',
          foundedYear: 1995,
          website: 'https://manufacturingplus.com',
          description: 'Leading manufacturing company'
        },
        branding: {
          logo: 'https://cdn.dummyjson.com/product-images/3/thumbnail.jpg',
          primaryColor: '#dc2626',
          secondaryColor: '#6b7280',
          fontFamily: 'Roboto, sans-serif',
          headerStyle: 'professional',
          footerStyle: 'detailed'
        },
        offerLetterDefaults: {
          defaultSalaryStructure: {
            hraPercentage: 0.1,
            specialAllowancePercentage: 0.113,
            statutoryBonusPercentage: 0.083,
            pfPercentage: 0.12,
            esicPercentage: 0.0325,
            gratuityPercentage: 0.048
          },
          defaultTerms: {
            probationPeriod: 6,
            noticePeriod: 60,
            contractDuration: 365,
            workingHours: '8 AM - 5 PM',
            workDays: 'Monday - Saturday'
          },
          defaultBenefits: [
            {
              name: 'Transport Allowance',
              type: 'allowance',
              value: '₹2000/month',
              isMandatory: true,
              description: 'Transportation allowance'
            },
            {
              name: 'Safety Equipment',
              type: 'non-monetary',
              value: 'Provided',
              isMandatory: true,
              description: 'Safety equipment and gear'
            }
          ]
        }
      }
    ]);
    console.log('Created Organisations:', organisations.length);

    // 3. Create Admins
    const admins = await Admin.create([
      {
        email: 'admin@techcorp.com',
        password: 'admin123',
        role: 'Admin',
        organisation: organisations[0]._id,
        status: 'active'
      },
      {
        email: 'admin@startuphub.com',
        password: 'admin123',
        role: 'Admin',
        organisation: organisations[1]._id,
        status: 'active'
      },
      {
        email: 'admin@manufacturingplus.com',
        password: 'admin123',
        role: 'Admin',
        organisation: organisations[2]._id,
        status: 'active'
      }
    ]);
    console.log('Created Admins:', admins.length);

    // 4. Create Users
    const users = await User.create([
      {
        email: 'user1@techcorp.com',
        password: 'user123',
        role: 'User',
        organisation: organisations[0]._id,
        status: 'active'
      },
      {
        email: 'user2@techcorp.com',
        password: 'user123',
        role: 'User',
        organisation: organisations[0]._id,
        status: 'active'
      },
      {
        email: 'user1@startuphub.com',
        password: 'user123',
        role: 'User',
        organisation: organisations[1]._id,
        status: 'active'
      },
      {
        email: 'user1@manufacturingplus.com',
        password: 'user123',
        role: 'User',
        organisation: organisations[2]._id,
        status: 'active'
      }
    ]);
    console.log('Created Users:', users.length);

    // 5. Create Companies
    const companies = await Company.create([
      {
        organisation: organisations[0]._id,
        profile: {
          companyName: 'TechCorp Solutions',
          industry: 'IT',
          companyType: 'corporate',
          employeeCount: '201-500',
          foundedYear: 2010,
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider',
          address: {
            street: '123 Tech Park',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560001'
          },
          contactInfo: {
            email: 'hr@techcorp.com',
            phone: '+91-80-12345678',
            contactPerson: 'HR Manager'
          }
        },
        branding: {
          logo: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Arial, sans-serif',
          headerStyle: 'modern',
          footerStyle: 'detailed'
        },
        salaryStructure: {
          hraPercentage: 0.1,
          specialAllowancePercentage: 0.113,
          statutoryBonusPercentage: 0.083,
          pfPercentage: 0.12,
          esicPercentage: 0.0325,
          gratuityPercentage: 0.048,
          professionalTax: 2400
        },
        employmentTerms: {
          probationPeriod: 6,
          noticePeriod: 30,
          contractDuration: 365,
          workingHours: '9 AM - 6 PM',
          workDays: 'Monday - Friday',
          overtimePolicy: 'As per company policy'
        },
        benefits: [
          {
            name: 'Health Insurance',
            type: 'insurance',
            value: 'Family coverage',
            isMandatory: true,
            description: 'Comprehensive health insurance',
            annualValue: 15000,
            monthlyValue: 1250
          },
          {
            name: 'Provident Fund',
            type: 'monetary',
            value: '12% of basic',
            isMandatory: true,
            description: 'Employee provident fund',
            annualValue: 0,
            monthlyValue: 0
          }
        ],
        requiredDocuments: [
          {
            name: 'PAN Card',
            isRequired: true,
            description: 'Permanent Account Number card',
            category: 'identity'
          },
          {
            name: 'Aadhaar Card',
            isRequired: true,
            description: 'Unique identification number',
            category: 'identity'
          },
          {
            name: 'Educational Certificates',
            isRequired: true,
            description: 'All educational certificates',
            category: 'education'
          }
        ],
        compliance: [
          {
            standard: 'ISO 27001',
            description: 'Information Security Management',
            isRequired: true,
            status: 'verified',
            expiryDate: new Date('2025-12-31'),
            certificateNumber: 'ISO27001-2024-001'
          }
        ],
        createdBy: users[0]._id,
        isActive: true
      },
      {
        organisation: organisations[1]._id,
        profile: {
          companyName: 'StartupHub Innovations',
          industry: 'IT',
          companyType: 'startup',
          employeeCount: '1-50',
          foundedYear: 2022,
          website: 'https://startuphub.com',
          description: 'Innovative startup in fintech',
          address: {
            street: '456 Startup Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400001'
          },
          contactInfo: {
            email: 'hr@startuphub.com',
            phone: '+91-22-87654321',
            contactPerson: 'HR Lead'
          }
        },
        branding: {
          logo: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg',
          primaryColor: '#10b981',
          secondaryColor: '#f59e0b',
          fontFamily: 'Inter, sans-serif',
          headerStyle: 'centered',
          footerStyle: 'minimal'
        },
        salaryStructure: {
          hraPercentage: 0.1,
          specialAllowancePercentage: 0.113,
          statutoryBonusPercentage: 0.083,
          pfPercentage: 0.12,
          esicPercentage: 0.0325,
          gratuityPercentage: 0.048,
          professionalTax: 2400
        },
        employmentTerms: {
          probationPeriod: 3,
          noticePeriod: 15,
          contractDuration: 365,
          workingHours: '10 AM - 7 PM',
          workDays: 'Monday - Friday',
          overtimePolicy: 'Flexible working hours'
        },
        benefits: [
          {
            name: 'ESOPs',
            type: 'equity',
            value: '0.1% - 0.5%',
            isMandatory: false,
            description: 'Employee Stock Option Plan',
            annualValue: 0,
            monthlyValue: 0
          },
          {
            name: 'Flexible Hours',
            type: 'non-monetary',
            value: true,
            isMandatory: false,
            description: 'Flexible working hours',
            annualValue: 0,
            monthlyValue: 0
          }
        ],
        requiredDocuments: [
          {
            name: 'PAN Card',
            isRequired: true,
            description: 'Permanent Account Number card',
            category: 'identity'
          },
          {
            name: 'Aadhaar Card',
            isRequired: true,
            description: 'Unique identification number',
            category: 'identity'
          }
        ],
        createdBy: users[2]._id,
        isActive: true
      }
    ]);
    console.log('Created Companies:', companies.length);

    // 6. Create Templates
    const templates = await Template.create([
      {
        name: 'Standard IT Offer Letter',
        description: 'Standard offer letter template for IT companies',
        version: 1,
        isActive: true,
        category: 'standard',
        industry: 'IT',
        companyType: 'corporate',
        department: organisations[0]._id,
        designation: 'Software Engineer',
        salaryStructureType: 'Fixed',
        companyBranding: {
          useCompanyLogo: true,
          useCompanyColors: true,
          useCompanyFont: true
        },
        content: {
          sections: [
            {
              id: 'header',
              type: 'header',
              title: 'Offer Letter',
              content: 'We are pleased to offer you the position of {{designation}} at {{company_name}}.',
              blocks: [
                {
                  type: 'text',
                  text: 'We are pleased to offer you the position of {{designation}} at {{company_name}}.',
                  formatting: {
                    fontWeight: 'bold',
                    fontSize: '18px',
                    textAlign: 'center'
                  }
                }
              ],
              placeholders: [
                {
                  key: '{{designation}}',
                  label: 'Designation',
                  type: 'text',
                  required: true,
                  category: 'job'
                },
                {
                  key: '{{company_name}}',
                  label: 'Company Name',
                  type: 'company',
                  required: true,
                  category: 'company'
                }
              ]
            },
            {
              id: 'salary_details',
              type: 'salary_table',
              title: 'Salary Details',
              content: 'Your compensation package includes:',
              placeholders: [
                {
                  key: '{{base_salary}}',
                  label: 'Base Salary',
                  type: 'currency',
                  required: true,
                  category: 'salary'
                },
                {
                  key: '{{total_ctc}}',
                  label: 'Total CTC',
                  type: 'currency',
                  required: true,
                  category: 'salary'
                }
              ]
            }
          ],
          placeholders: [
            {
              key: '{{candidate_name}}',
              label: 'Candidate Name',
              type: 'text',
              required: true,
              category: 'candidate'
            },
            {
              key: '{{candidate_email}}',
              label: 'Candidate Email',
              type: 'text',
              required: true,
              category: 'candidate'
            },
            {
              key: '{{joining_date}}',
              label: 'Joining Date',
              type: 'date',
              required: true,
              category: 'job'
            }
          ]
        },
        metadata: {
          createdBy: users[0]._id,
          organisation: organisations[0]._id,
          tags: ['IT', 'standard', 'corporate'],
          complexity: 'simple'
        }
      },
             {
         name: 'Startup Offer Letter',
         description: 'Modern offer letter template for startups',
         version: 1,
         isActive: true,
         category: 'custom',
         industry: 'IT',
         companyType: 'startup',
         department: organisations[1]._id,
         designation: 'Full Stack Developer',
         salaryStructureType: 'Hybrid',
        companyBranding: {
          useCompanyLogo: true,
          useCompanyColors: true,
          useCompanyFont: true
        },
        content: {
          sections: [
            {
              id: 'header',
              type: 'header',
              title: 'Welcome to the Team!',
              content: 'We\'re excited to have you join {{company_name}} as {{designation}}.',
              blocks: [
                {
                  type: 'text',
                  text: 'We\'re excited to have you join {{company_name}} as {{designation}}.',
                  formatting: {
                    fontWeight: 'bold',
                    fontSize: '20px',
                    textAlign: 'center',
                    color: '#10b981'
                  }
                }
              ],
              placeholders: [
                {
                  key: '{{designation}}',
                  label: 'Designation',
                  type: 'text',
                  required: true,
                  category: 'job'
                },
                {
                  key: '{{company_name}}',
                  label: 'Company Name',
                  type: 'company',
                  required: true,
                  category: 'company'
                }
              ]
            }
          ],
          placeholders: [
            {
              key: '{{candidate_name}}',
              label: 'Candidate Name',
              type: 'text',
              required: true,
              category: 'candidate'
            },
            {
              key: '{{candidate_email}}',
              label: 'Candidate Email',
              type: 'text',
              required: true,
              category: 'candidate'
            }
          ]
        },
        metadata: {
          createdBy: users[2]._id,
          organisation: organisations[1]._id,
          tags: ['startup', 'IT', 'modern'],
          complexity: 'simple'
        }
      }
    ]);
    console.log('Created Templates:', templates.length);

    // 7. Create Generated Offers
    const generatedOffers = await GeneratedOffer.create([
      {
        templateId: templates[0]._id,
        templateVersion: 1,
        candidateData: {
          candidate_name: 'John Doe',
          candidate_email: 'john.doe@example.com',
          candidate_phone: '+91-9876543210',
          candidate_address: '123 Main Street, Bangalore, Karnataka',
          designation: 'Software Engineer',
          department: 'Engineering',
          band_level: 'L2',
          work_location: 'Bangalore',
          joining_date: new Date('2024-03-01'),
          base_salary: 800000,
          hra: 80000,
          special_allowance: 90400,
          statutory_bonus: 66400,
          gross_salary: 1036800,
          total_ctc: 1200000,
          contract_duration_days: 365,
          contract_end_date: new Date('2025-02-28'),
          notice_period_days: 30,
          probation_period_months: 6,
          company_name: 'TechCorp Solutions',
          company_address: '123 Tech Park, Bangalore, Karnataka',
          company_logo: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg'
        },
        companyData: {
          companyId: organisations[0]._id,
          companyName: 'TechCorp Solutions',
          industry: 'IT',
          companyType: 'corporate',
          branding: {
            logo: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            fontFamily: 'Arial, sans-serif'
          }
        },
        salaryBreakdown: {
          basic: {
            annual: 800000,
            monthly: 66667
          },
          hra: {
            annual: 80000,
            monthly: 6667
          },
          specialAllowance: {
            annual: 90400,
            monthly: 7533
          },
          statutoryBonus: {
            annual: 66400,
            monthly: 5533
          },
          grossSalary: {
            annual: 1036800,
            monthly: 86400
          },
          total_ctc: {
            annual: 1200000,
            monthly: 100000
          }
        },
        renderedContent: {
          html: '<h1>Offer Letter</h1><p>We are pleased to offer you the position of Software Engineer at TechCorp Solutions.</p>',
          plainText: 'Offer Letter\n\nWe are pleased to offer you the position of Software Engineer at TechCorp Solutions.'
        },
        metadata: {
          generatedBy: users[0]._id,
          organisation: organisations[0]._id,
          industry: 'IT',
          companyType: 'corporate',
          location: 'Bangalore',
          currency: 'INR'
        },
        status: 'draft'
      },
      {
        templateId: templates[1]._id,
        templateVersion: 1,
        candidateData: {
          candidate_name: 'Jane Smith',
          candidate_email: 'jane.smith@example.com',
          candidate_phone: '+91-9876543211',
          candidate_address: '456 Oak Avenue, Mumbai, Maharashtra',
          designation: 'Full Stack Developer',
          department: 'Development',
          band_level: 'L1',
          work_location: 'Mumbai',
          joining_date: new Date('2024-03-15'),
          base_salary: 600000,
          hra: 60000,
          special_allowance: 67800,
          statutory_bonus: 49800,
          gross_salary: 777600,
          total_ctc: 900000,
          contract_duration_days: 365,
          contract_end_date: new Date('2025-03-14'),
          notice_period_days: 15,
          probation_period_months: 3,
          company_name: 'StartupHub Innovations',
          company_address: '456 Startup Street, Mumbai, Maharashtra',
          company_logo: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg'
        },
        companyData: {
          companyId: organisations[1]._id,
          companyName: 'StartupHub Innovations',
          industry: 'IT',
          companyType: 'startup',
          branding: {
            logo: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg',
            primaryColor: '#10b981',
            secondaryColor: '#f59e0b',
            fontFamily: 'Inter, sans-serif'
          }
        },
        salaryBreakdown: {
          basic: {
            annual: 600000,
            monthly: 50000
          },
          hra: {
            annual: 60000,
            monthly: 5000
          },
          specialAllowance: {
            annual: 67800,
            monthly: 5650
          },
          statutoryBonus: {
            annual: 49800,
            monthly: 4150
          },
          grossSalary: {
            annual: 777600,
            monthly: 64800
          },
          total_ctc: {
            annual: 900000,
            monthly: 75000
          }
        },
        renderedContent: {
          html: '<h1>Welcome to the Team!</h1><p>We\'re excited to have you join StartupHub Innovations as Full Stack Developer.</p>',
          plainText: 'Welcome to the Team!\n\nWe\'re excited to have you join StartupHub Innovations as Full Stack Developer.'
        },
        metadata: {
          generatedBy: users[2]._id,
          organisation: organisations[1]._id,
          industry: 'IT',
          companyType: 'startup',
          location: 'Mumbai',
          currency: 'INR'
        },
        status: 'draft'
      }
    ]);
    console.log('Created Generated Offers:', generatedOffers.length);

    console.log('Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Superadmin: ${superadmin.email}`);
    console.log(`- Organisations: ${organisations.length}`);
    console.log(`- Admins: ${admins.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Templates: ${templates.length}`);
    console.log(`- Generated Offers: ${generatedOffers.length}`);

    console.log('\nDemo Credentials:');
    console.log('Superadmin: superadmin@example.com / superadmin123');
    console.log('Admin (TechCorp): admin@techcorp.com / admin123');
    console.log('Admin (StartupHub): admin@startuphub.com / admin123');
    console.log('Admin (ManufacturingPlus): admin@manufacturingplus.com / admin123');
    console.log('User (TechCorp): user1@techcorp.com / user123');
    console.log('User (StartupHub): user1@startuphub.com / user123');
    console.log('User (ManufacturingPlus): user1@manufacturingplus.com / user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = { connectDB, seedData };
