# Overview

This is a Fire Safety Inspection & Test Management (ITM) application built for NFPA 25 compliance. The system allows fire safety inspectors to create, manage, and track inspections of fire protection systems including sprinkler systems, standpipes, pumps, and control valves. The application provides a comprehensive dashboard for monitoring inspection status and progress, along with detailed forms for conducting thorough fire safety inspections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing with `/`, `/inspection/:id?` routes
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming and custom design system
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js server with TypeScript for API endpoints
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **API Design**: RESTful endpoints under `/api` prefix for inspections and user management with automatic legacy address parsing
- **Data Validation**: Zod schemas for runtime type checking and validation with Brazilian address structures
- **Development Setup**: Hot module replacement with Vite middleware integration

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Tables**: 
  - `users` - Inspector profiles with credentials and licensing information
  - `inspections` - Main inspection records with facility details and progress tracking, includes structured address fields
  - `systemInspections` - Individual system test results and deficiencies
  - `archivedReports` - Stored inspection reports with structured property address fields
- **Schema Features**: UUID primary keys, JSONB for flexible data storage, timestamps for audit trails
- **Address Architecture**: Structured Brazilian address fields (logradouro, número, bairro, município, estado/UF, CEP) with backward compatibility for legacy address fields

## Form Management
- **Multi-section Forms**: Progressive form navigation through general info, system types, and final inspection
- **State Persistence**: Form data persistence across navigation with real-time progress tracking
- **Validation**: Client-side validation with Zod schemas matching backend validation
- **User Experience**: Sidebar navigation, progress indicators, and auto-save functionality
- **Address Management**: Structured AddressFields component with Brazilian postal standards, CEP masking, UF validation, and real-time preview

## Development Configuration
- **TypeScript**: Strict configuration with path mapping for clean imports
- **Code Quality**: ESModule format throughout with proper import/export patterns
- **Asset Management**: Vite-based asset handling with alias resolution
- **Development Tools**: Runtime error overlay and Replit integration for cloud development

# External Dependencies

## UI Component Library
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography throughout the application

## Database & ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with migration support
- **Drizzle Kit**: Database migration and schema management tools

## Development & Build Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Static type checking and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **ESBuild**: Fast JavaScript bundling for production builds

## Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation integration
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities

## Session & Authentication
- **Express Session**: Session management with PostgreSQL store
- **Connect PG Simple**: PostgreSQL session store for persistent sessions
- **Crypto**: UUID generation for unique identifiers

## Development Environment
- **Replit Integration**: Cloud development environment with specialized plugins
- **Runtime Error Modal**: Development error handling and debugging
- **Cartographer**: Development tooling for Replit environment