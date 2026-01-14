# 🎯 Offer Letter Template System - Backend Implementation

## 📋 Overview

The Offer Letter Template System is a comprehensive backend solution that enables users to create, manage, and generate dynamic offer letters using structured templates. The system supports complex formatting, dynamic placeholders, and automated offer generation.

## 🏗️ Architecture

### **Core Components**

1. **Template Engine** (`templateEngine.js`) - Handles template parsing, rendering, and placeholder replacement
2. **Template Model** (`template.js`) - Database schema for templates with version control
3. **Generated Offer Model** (`generatedOffer.js`) - Database schema for generated offers
4. **Controllers** - Handle HTTP requests and business logic
5. **Routes** - Define API endpoints
6. **Validation Middleware** - Ensure data integrity

### **Data Flow**

```
User Request → Validation → Controller → Service → Database
     ↓
Response ← Controller ← Service ← Database
```

## 🗄️ Database Models

### **Template Model**

The template model stores offer letter templates with structured content:

```javascript
{
  name: "Template Name",
  content: {
    sections: [
      {
        id: "section_id",
        type: "header|paragraph|rich_text|table|list|salary_table",
        content: "Content or blocks array",
        formatting: { fontWeight, fontSize, color, textAlign, ... },
        styling: { margin, padding, backgroundColor, border, ... }
      }
    ],
    placeholders: [
      {
        key: "{{placeholder_key}}",
        label: "Human readable label",
        type: "text|number|date|currency|dropdown|calculated",
        required: boolean,
        defaultValue: "Default value",
        category: "candidate|job|salary|company|legal"
      }
    ]
  }
}
```

### **Generated Offer Model**

Stores generated offers with candidate data and rendered content:

```javascript
{
  templateId: "Template reference",
  candidateData: {
    candidate_name: "John Doe",
    designation: "Software Engineer",
    base_salary: 50000,
    total_ctc: 75000,
    // ... other fields
  },
  renderedContent: {
    html: "Rendered HTML",
    plainText: "Plain text version"
  },
  status: "draft|sent|viewed|accepted|rejected",
  tracking: { sentAt, viewedAt, viewCount, ... }
}
```

## 🔧 Template Engine

### **Supported Section Types**

1. **Header** - Titles and headings with formatting
2. **Paragraph** - Simple text content with placeholders
3. **Rich Text** - Complex content with mixed text and placeholders
4. **Table** - Structured data presentation
5. **List** - Bulleted or numbered lists
6. **Salary Table** - Auto-generated salary breakdown
7. **Document List** - Required documents checklist

### **Formatting Options**

- **Text Formatting**: `fontWeight`, `fontSize`, `color`, `textAlign`, `textDecoration`, `fontStyle`
- **Styling**: `margin`, `padding`, `backgroundColor`, `border`, `borderRadius`, `boxShadow`
- **Global Styling**: `fontFamily`, `fontSize`, `lineHeight`, `color`, `backgroundColor`

### **Placeholder System**

Placeholders are replaced with actual data during offer generation:

```javascript
// Template content
"We are pleased to offer you the position of {{designation}} in our {{department}} team."

// Generated with data
"We are pleased to offer you the position of Software Engineer in our Engineering team."
```

## 🚀 API Endpoints

### **Template Management**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/templates/create` | Create new template |
| `GET` | `/api/user/templates/list` | Get all templates |
| `GET` | `/api/user/templates/:id` | Get template by ID |
| `PUT` | `/api/user/templates/:id` | Update template |
| `DELETE` | `/api/user/templates/:id` | Delete template |
| `POST` | `/api/user/templates/:id/duplicate` | Duplicate template |
| `GET` | `/api/user/templates/:id/placeholders` | Get template placeholders |
| `POST` | `/api/user/templates/:id/preview` | Preview template |
| `GET` | `/api/user/templates/stats/overview` | Get template statistics |

### **Offer Generation**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/offers/generate` | Generate single offer |
| `POST` | `/api/user/offers/bulk-generate` | Generate multiple offers |
| `GET` | `/api/user/offers/list` | Get all offers |
| `GET` | `/api/user/offers/:id` | Get offer by ID |
| `PUT` | `/api/user/offers/:id/status` | Update offer status |
| `POST` | `/api/user/offers/:id/send` | Send offer to candidate |
| `POST` | `/api/user/offers/:id/view` | Mark offer as viewed |
| `GET` | `/api/user/offers/:id/download` | Download offer document |
| `GET` | `/api/user/offers/analytics/overview` | Get offer analytics |

## 📝 Usage Examples

### **Creating a Template**

```javascript
const templateData = {
  name: "Software Engineer Offer",
  description: "Standard offer for software engineers",
  category: "standard",
  department: "org_id_here",
  content: {
    sections: [
      {
        id: "header",
        type: "header",
        content: "Offer Letter for {{candidate_name}}",
        formatting: { fontWeight: "bold", fontSize: "20px" }
      },
      {
        id: "main_content",
        type: "rich_text",
        content: {
          blocks: [
            { type: "text", text: "We are pleased to offer you the position of " },
            { type: "placeholder", key: "{{designation}}" },
            { type: "text", text: " in our team." }
          ]
        }
      }
    ],
    placeholders: [
      {
        key: "{{candidate_name}}",
        label: "Candidate Name",
        type: "text",
        required: true
      },
      {
        key: "{{designation}}",
        label: "Job Designation",
        type: "text",
        required: true
      }
    ]
  }
};

// API call
const response = await fetch('/api/user/templates/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(templateData)
});
```

### **Generating an Offer**

```javascript
const offerData = {
  templateId: "template_id_here",
  candidateData: {
    candidate_name: "John Doe",
    candidate_email: "john.doe@email.com",
    designation: "Software Engineer",
    department: "Engineering",
    base_salary: 50000,
    total_ctc: 75000,
    joining_date: "2024-02-01"
  }
};

// API call
const response = await fetch('/api/user/offers/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(offerData)
});
```

### **Bulk Offer Generation**

```javascript
const bulkData = {
  templateId: "template_id_here",
  candidates: [
    {
      candidate_name: "John Doe",
      candidate_email: "john.doe@email.com",
      designation: "Software Engineer",
      department: "Engineering",
      base_salary: 50000,
      total_ctc: 75000
    },
    {
      candidate_name: "Jane Smith",
      candidate_email: "jane.smith@email.com",
      designation: "Product Manager",
      department: "Product",
      base_salary: 80000,
      total_ctc: 120000
    }
  ]
};

// API call
const response = await fetch('/api/user/offers/bulk-generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bulkData)
});
```

## 🔒 Security & Validation

### **Authentication**

All endpoints require valid JWT authentication with user role verification.

### **Data Validation**

- **Template Validation**: Ensures proper structure and required fields
- **Offer Validation**: Validates candidate data and business rules
- **Input Sanitization**: Prevents XSS and injection attacks

### **Access Control**

- Users can only access templates and offers from their organisation
- Template editing restricted to creators and admins
- Offer status updates require proper permissions

## 📊 Analytics & Tracking

### **Template Analytics**

- Template usage statistics
- Complexity analysis
- Version history tracking

### **Offer Analytics**

- Offer generation metrics
- Response rates and timing
- Status distribution
- Performance trends

## 🚀 Performance Features

### **Optimization**

- Database indexing for fast queries
- Pagination for large datasets
- Efficient placeholder replacement
- Caching for frequently accessed templates

### **Scalability**

- Modular architecture
- Stateless design
- Horizontal scaling support
- Database connection pooling

## 🔧 Configuration

### **Environment Variables**

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/offer_letters

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

### **Database Indexes**

```javascript
// Template indexes
templateSchema.index({ organisation: 1, isActive: 1 });
templateSchema.index({ 'metadata.createdBy': 1 });
templateSchema.index({ category: 1, department: 1 });

// Offer indexes
generatedOfferSchema.index({ 'metadata.organisation': 1, status: 1 });
generatedOfferSchema.index({ 'metadata.generatedBy': 1 });
generatedOfferSchema.index({ templateId: 1, status: 1 });
```

## 🧪 Testing

### **Test Coverage**

- Unit tests for template engine
- Integration tests for API endpoints
- Validation tests for data integrity
- Performance tests for scalability

### **Sample Data**

Use the provided sample template (`sampleTemplate.js`) for testing and development.

## 🚀 Deployment

### **Requirements**

- Node.js 16+
- MongoDB 5+
- Redis (optional, for caching)

### **Installation**

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start server
npm start
```

### **Docker Support**

```bash
# Build image
docker build -t offer-letter-backend .

# Run container
docker run -p 3000:3000 offer-letter-backend
```

## 🔮 Future Enhancements

### **Planned Features**

- PDF generation with custom styling
- Email templates and automation
- Advanced analytics dashboard
- Template marketplace
- Multi-language support
- Mobile app integration

### **Integration Possibilities**

- HRIS systems integration
- Applicant tracking systems
- E-signature services
- Document management systems
- Payment gateway integration

## 📞 Support

For technical support or questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs through the issue tracker
- **Features**: Request new features through the feature request system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for modern HR operations**
