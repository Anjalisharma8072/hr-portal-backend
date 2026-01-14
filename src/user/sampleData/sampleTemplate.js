/**
 * Sample Template Data for Offer Letter System
 * This demonstrates the structured content approach for complex templates
 */

const sampleTemplate = {
  name: "Standard Software Engineer Offer Letter",
  description: "Standard offer letter template for software engineering positions",
  category: "standard",
  department: "64a1b2c3d4e5f6789012345a", // This should be replaced with actual org ID
  designation: "Software Engineer",
  salaryStructureType: "Fixed",
  
  content: {
    sections: [
      {
        id: "company_header",
        type: "header",
        title: "Company Header",
        content: "TechCorp Solutions Pvt. Ltd.",
        formatting: {
          fontWeight: "bold",
          fontSize: "24px",
          color: "#1a365d",
          textAlign: "center"
        },
        styling: {
          fontSize: "24px",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#f7fafc",
          border: "2px solid #e2e8f0",
          borderRadius: "8px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 1
        }
      },
      
      {
        id: "candidate_address",
        type: "paragraph",
        content: "{{candidate_name}}\n{{candidate_address}}",
        formatting: {
          fontWeight: "normal",
          fontSize: "14px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 2
        }
      },
      
      {
        id: "subject_line",
        type: "header",
        title: "Subject",
        content: "Subject: Offer of Employment - {{designation}} Position",
        formatting: {
          fontWeight: "bold",
          fontSize: "16px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "16px",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#edf2f7"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 3
        }
      },
      
      {
        id: "greeting",
        type: "paragraph",
        content: "Dear {{candidate_name}},",
        formatting: {
          fontWeight: "normal",
          fontSize: "14px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "14px",
          marginBottom: "15px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 4
        }
      },
      
      {
        id: "main_content",
        type: "rich_text",
        content: {
          blocks: [
            {
              type: "text",
              text: "We are pleased to offer you the position of ",
              formatting: { fontWeight: "normal" }
            },
            {
              type: "placeholder",
              key: "{{designation}}",
              formatting: { fontWeight: "bold", color: "#000000" }
            },
            {
              type: "text",
              text: " in our ",
              formatting: { fontWeight: "normal" }
            },
            {
              type: "placeholder",
              key: "{{department}}",
              formatting: { fontWeight: "bold", color: "#000000" }
            },
            {
              type: "text",
              text: " team at TechCorp Solutions Pvt. Ltd.",
              formatting: { fontWeight: "normal" }
            }
          ]
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 5
        }
      },
      
      {
        id: "position_details",
        type: "paragraph",
        content: "This offer is contingent upon your acceptance and successful completion of all pre-employment requirements. Your employment will commence on {{joining_date}} and you will be based at our {{work_location}} office.",
        formatting: {
          fontWeight: "normal",
          fontSize: "14px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 6
        }
      },
      
      {
        id: "salary_section",
        type: "header",
        title: "Compensation & Benefits",
        content: "Compensation & Benefits",
        formatting: {
          fontWeight: "bold",
          fontSize: "18px",
          color: "#1a365d"
        },
        styling: {
          fontSize: "18px",
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: "#bee3f8",
          border: "1px solid #90cdf4",
          borderRadius: "5px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 7
        }
      },
      
      {
        id: "salary_table",
        type: "salary_table",
        content: {
          // This will be automatically generated by the template engine
        },
        styling: {
          marginBottom: "25px"
        },
        metadata: {
          isRequired: true,
          isEditable: false,
          order: 8
        }
      },
      
      {
        id: "benefits_list",
        type: "list",
        content: {
          items: [
            "Health Insurance Coverage",
            "Provident Fund (12% employer contribution)",
            "Gratuity as per Payment of Gratuity Act",
            "Annual Leave: 21 days per year",
            "Sick Leave: 12 days per year",
            "Professional Development Allowance",
            "Performance Bonus (up to 20% of base salary)"
          ]
        },
        formatting: {
          fontWeight: "normal",
          fontSize: "14px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "5px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 9
        }
      },
      
      {
        id: "terms_conditions",
        type: "header",
        title: "Terms & Conditions",
        content: "Terms & Conditions",
        formatting: {
          fontWeight: "bold",
          fontSize: "18px",
          color: "#1a365d"
        },
        styling: {
          fontSize: "18px",
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: "#bee3f8",
          border: "1px solid #90cdf4",
          borderRadius: "5px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 10
        }
      },
      
      {
        id: "terms_content",
        type: "rich_text",
        content: {
          blocks: [
            {
              type: "text",
              text: "1. ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "Probation Period: ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "You will be on probation for {{probation_period_months}} months from your date of joining.",
              formatting: { fontWeight: "normal" }
            },
            {
              type: "text",
              text: "\n\n2. ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "Notice Period: ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "{{notice_period_days}} days notice is required for resignation.",
              formatting: { fontWeight: "normal" }
            },
            {
              type: "text",
              text: "\n\n3. ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "Confidentiality: ",
              formatting: { fontWeight: "bold" }
            },
            {
              type: "text",
              text: "You will be required to sign a confidentiality agreement.",
              formatting: { fontWeight: "normal" }
            }
          ]
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 11
        }
      },
      
      {
        id: "document_requirements",
        type: "document_list",
        content: {
          title: "Required Documents",
          items: [
            "Updated Resume",
            "Educational Certificates",
            "Previous Employment Certificates",
            "PAN Card Copy",
            "Aadhaar Card Copy",
            "Passport Size Photographs",
            "Address Proof"
          ]
        },
        styling: {
          marginBottom: "25px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 12
        }
      },
      
      {
        id: "closing",
        type: "paragraph",
        content: "We are excited to have you join our team and look forward to your positive response. Please confirm your acceptance by signing and returning a copy of this offer letter within 7 days.",
        formatting: {
          fontWeight: "normal",
          fontSize: "14px",
          color: "#2d3748"
        },
        styling: {
          fontSize: "14px",
          lineHeight: "1.6",
          marginBottom: "20px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 13
        }
      },
      
      {
        id: "signature_section",
        type: "table",
        content: {
          headers: ["For TechCorp Solutions Pvt. Ltd.", "Candidate Acceptance"],
          rows: [
            ["", ""],
            ["", ""],
            ["HR Manager", "{{candidate_name}}"],
            ["Date: ___________", "Date: ___________"],
            ["", "Signature: ___________"]
          ]
        },
        styling: {
          marginBottom: "30px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 14
        }
      },
      
      {
        id: "footer",
        type: "paragraph",
        content: "This offer is valid for 30 days from the date of issue. For any queries, please contact our HR team at hr@techcorp.com or call +91-XXXXXXXXXX.",
        formatting: {
          fontWeight: "normal",
          fontSize: "12px",
          color: "#718096",
          textAlign: "center"
        },
        styling: {
          fontSize: "12px",
          lineHeight: "1.4",
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "5px"
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 15
        }
      }
    ],
    
    placeholders: [
      {
        key: "{{candidate_name}}",
        label: "Candidate Name",
        type: "text",
        required: true,
        defaultValue: "",
        description: "Full name of the candidate",
        category: "candidate"
      },
      {
        key: "{{candidate_address}}",
        label: "Candidate Address",
        type: "text",
        required: false,
        defaultValue: "",
        description: "Current address of the candidate",
        category: "candidate"
      },
      {
        key: "{{designation}}",
        label: "Job Designation",
        type: "text",
        required: true,
        defaultValue: "Software Engineer",
        description: "Job title/position",
        category: "job"
      },
      {
        key: "{{department}}",
        label: "Department",
        type: "text",
        required: true,
        defaultValue: "Engineering",
        description: "Department name",
        category: "job"
      },
      {
        key: "{{work_location}}",
        label: "Work Location",
        type: "text",
        required: false,
        defaultValue: "Bangalore",
        description: "Office location",
        category: "job"
      },
      {
        key: "{{joining_date}}",
        label: "Joining Date",
        type: "date",
        required: true,
        defaultValue: "",
        description: "Date of joining",
        category: "job"
      },
      {
        key: "{{base_salary}}",
        label: "Base Salary",
        type: "currency",
        required: true,
        defaultValue: "",
        description: "Monthly base salary",
        category: "salary"
      },
      {
        key: "{{total_ctc}}",
        label: "Total CTC",
        type: "currency",
        required: true,
        defaultValue: "",
        description: "Total cost to company per month",
        category: "salary"
      },
      {
        key: "{{probation_period_months}}",
        label: "Probation Period (Months)",
        type: "number",
        required: false,
        defaultValue: "6",
        description: "Probation period in months",
        category: "legal"
      },
      {
        key: "{{notice_period_days}}",
        label: "Notice Period (Days)",
        type: "number",
        required: false,
        defaultValue: "60",
        description: "Notice period in days",
        category: "legal"
      }
    ],
    
    globalStyling: {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#2d3748",
      backgroundColor: "#ffffff"
    }
  },
  
  metadata: {
    createdBy: "64a1b2c3d4e5f6789012345b", // This should be replaced with actual user ID
    organisation: "64a1b2c3d4e5f6789012345a", // This should be replaced with actual org ID
    tags: ["software", "engineering", "standard", "full-time"],
    estimatedCompletionTime: 15,
    complexity: "medium"
  },
  
  settings: {
    allowDuplication: true,
    requireApproval: false,
    autoSave: true,
    saveInterval: 30000,
    maxVersions: 10
  }
};

module.exports = sampleTemplate;
