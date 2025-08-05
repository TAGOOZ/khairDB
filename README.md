# Khair Database - Comprehensive Charity Management System

A modern, full-featured management system designed to streamline charitable operations, track beneficiaries, manage distributions, and coordinate family assistance programs with multi-language support and role-based access control.

## 🌟 Overview

Khair Database is a comprehensive digital solution for charitable organizations to manage their operations efficiently. The system provides tools for beneficiary management, family coordination, distribution tracking, and administrative oversight with complete Arabic and English language support.

## 🎯 Core Features

### 👥 Individual Management System
- **Complete Beneficiary Profiles**: Detailed records including personal information, contact details, employment status, and family relationships
- **Assistance Tracking**: Comprehensive tracking of different assistance types:
  - **Medical Assistance**: Track medical needs, insurance coverage, treatment costs, and medication requirements
  - **Food Assistance**: Monitor food supply cards, meal programs, and nutritional support
  - **Marriage Assistance**: Support for wedding expenses, contract signing, and related needs
  - **Debt Assistance**: Track debt amounts, payment plans, and financial obligations
  - **Education Assistance**: Support for school fees, educational materials, and family education levels
  - **Shelter Assistance**: Housing condition assessments, appliance needs, and accommodation support
- **Children Management**: Track children's information including school stages, educational needs, and development
- **Additional Family Members**: Support for extended family members not in the main registry
- **Google Drive Integration**: Automatic folder creation for document storage and photo management
- **Request System**: User role can submit requests for admin approval
- **Status Management**: Whitelist, blacklist, and waitlist classifications

### 👪 Family Management System
- **Household Organization**: Group individuals into family units with parent-child relationships
- **Family Status Tracking**: Color-coded status system (Green, Yellow, Red) for quick assessment
- **Complete Family Profiles**: Address, phone, district information, and family size
- **Multi-generational Support**: Track grandparents, parents, children, and extended family
- **Family-wide Operations**: Bulk operations for entire families in distributions

### 📦 Distribution Management System
- **Aid Distribution Tracking**: Complete record-keeping for all charitable distributions
- **Multi-recipient Support**: Distribute to individuals, children, and additional family members
- **Flexible Aid Types**: Support for food, medical, educational, emergency, and other aid categories
- **Quantity and Value Tracking**: Precise accounting of distributed items and monetary values
- **Recipient Selection Tools**:
  - Individual selection with search and filters
  - Family-wide selection (all members at once)
  - District-based bulk selection
  - Assistance type filtering (select all with specific needs)
  - Advanced selection tools (children only, additional members only)
- **Bulk Operations**: Select all, deselect all, delete multiple recipients
- **Distribution History**: Complete audit trail of all distributions
- **Status Management**: Track distribution progress from planning to completion

### 📊 Dashboard & Reports System
- **Real-time Statistics**: Live counts of individuals, families, children, and distributions
- **Visual Analytics**: Charts and graphs showing:
  - Distribution trends over time
  - Assistance type breakdowns
  - District-wise statistics
  - Family status distributions
- **Needs Analysis**: Comprehensive reporting on assistance requirements
- **Pending Requests**: Admin interface for reviewing and approving user submissions
- **Export Capabilities**: Generate reports for external analysis

### 🔐 Authentication & Access Control
- **Role-based System**: 
  - **Admin Users**: Full system access, approval capabilities, complete CRUD operations
  - **Regular Users**: Submit requests for admin approval, view restricted data
- **Secure Authentication**: Supabase-powered authentication with email/password
- **User Management**: Admin tools for managing user accounts and permissions

### 🌐 Multi-language Support
- **Complete Bilingual Interface**: Full Arabic and English language support
- **RTL/LTR Layout Support**: Proper right-to-left layout for Arabic interface
- **Cultural Localization**: Date formats, number formats, and cultural conventions
- **Dynamic Language Switching**: Real-time language switching without page reload

### 🔍 Advanced Search & Filtering
- **Global Search**: Search across individuals, families, and children
- **Advanced Filters**:
  - District-based filtering
  - Assistance type filtering
  - Distribution history filtering
  - Family status filtering
  - Date range filtering
- **Smart Search**: Search by name, ID number, phone, or any identifying information

## 🛠️ Technical Architecture

### Frontend Technology Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first styling with responsive design
- **React Hook Form**: Advanced form handling with validation
- **Zod Schema Validation**: Runtime type checking and form validation
- **Lucide React**: Modern icon system
- **React Router**: Client-side routing with state management

### Backend & Database
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Subscriptions**: Live data updates across the application
- **Advanced SQL Functions**: Custom database functions for complex operations

### Integrations
- **Google Drive API**: Automatic document folder creation and management
- **Google Cloud Storage**: Secure file storage and sharing capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google Drive API credentials (optional but recommended)

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd khairDB
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env.local` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
   ```

4. **Database Setup**:
   ```bash
   npm run setup-db
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Google Drive Integration Setup

For document management capabilities:

1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Drive API
4. Generate API credentials
5. Add credentials to environment variables

The system creates organized folder structures:
```
Khair Database/
├── Individual Documents/
│   ├── [Individual Name]/
│   │   ├── Documents/
│   │   ├── Photos/
│   │   └── Medical Records/
```

## 📱 User Guide

### For Admin Users
1. **Dashboard Overview**: Access real-time statistics and pending requests
2. **Individual Management**: Create, edit, and manage beneficiary profiles
3. **Family Organization**: Group individuals into families and manage relationships
4. **Distribution Planning**: Create and manage aid distributions
5. **User Management**: Approve requests and manage user permissions
6. **Reports & Analytics**: Generate insights and export data

### For Regular Users
1. **Submit Requests**: Create requests for new individuals or assistance
2. **View Data**: Access assigned individuals and families
3. **Search & Filter**: Find beneficiaries using advanced search tools
4. **Language Support**: Switch between Arabic and English interfaces

## 🔧 Development

### Project Structure
```
src/
├── pages/           # Main application pages
├── components/      # Reusable UI components
├── services/        # API and business logic
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
├── lib/            # Utility libraries
├── contexts/       # React contexts
├── translations/   # Language files
└── styles/         # Global styles

supabase/
├── migrations/     # Database migrations
├── functions/      # Database functions
└── schemas/        # Database schemas
```

### Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run test` - Run test suite
- `npm run lint` - Code quality checks
- `npm run type-check` - TypeScript validation

### Contributing Guidelines
1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint conventions
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Khair Database** - Empowering charitable organizations with modern technology to serve those in need more effectively. 