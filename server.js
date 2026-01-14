const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./src/superAdmin/routes/authRoutes');
const saOrgRoutes = require('./src/superAdmin/routes/superAdminOrganisationRoutes');
const adminRoutes = require('./src/superAdmin/routes/adminRoutes')

const userRoutes = require('./src/admin/routes/userRoutes');
const adminAuthRoutes = require('./src/admin/routes/authRoutes');

const userAuthRoutes = require('./src/user/routes/authRoutes');
const userTemplateRoutes = require('./src/user/routes/templateRoutes');
const userOfferRoutes = require('./src/user/routes/offerRoutes');
const universalCompanyRoutes = require('./src/user/routes/universalCompanyRoutes');
const companyRoutes = require('./src/user/routes/companyRoutes');
const fileUploadRoutes = require('./src/user/routes/fileUploadRoutes');
const analyticsRoutes = require('./src/user/routes/analyticsRoutes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
   });

// Routes
app.use('/api/superAdmin/auth', authRoutes);
app.use('/api/superAdmin/org', saOrgRoutes);
app.use('/api/superAdmin/admin', adminRoutes);

app.use('/api/admin/users', userRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/templates', userTemplateRoutes);
app.use('/api/user/offers', userOfferRoutes);
app.use('/api/user/universal', universalCompanyRoutes);
app.use('/api/user/company', companyRoutes);
app.use('/api/user/upload', fileUploadRoutes);
app.use('/api/user/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => {
   res.send('HR Portal API is running and connected to MongoDB!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
   console.log(`CORS enabled for: http://localhost:5173`);
});