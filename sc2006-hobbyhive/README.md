# HobbyHive 🎨

Welcome to the official repository for NTU SC2006 Software Engineering group project **_HobbyHive_**.

<p align='center'>
  <img src="/sc2006-hobbyhive/public/card.png" width=600 />
</p>

<p align="center">
    <a href="https://github.com/divisha-jn/HobbyHive/tree/main/sc2006-hobbyhive">Code</a>
    |
    <a href="https://youtu.be/d8QiLKlCu-0">Demo Video</a>
</p>

HobbyHive believes in **connecting people** through shared experiences. Our platform empowers communities to **discover, host, and manage events,** from local gatherings to large-scale activities, all in one place.

This project applied **software engineering best practices** and **design patterns** to ensure high reliability, performance, and extensibility for future enhancements.


<br>



**Table of Contents**

- [HobbyHive](#hobbyhive-)
- [Setup Instructions](#setup-instructions)
- [Pre-configured Users](#pre-configured-users)
- [Documentation](#documentation)
- [Design](#design)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [File Structure](#file-structure)
  - [Software Engineering Practices](#software-engineering-practices)
  - [Design Patterns](#design-patterns)
  - [SOLID Principles](#solid-principles)
  - [Tech Stack](#tech-stack)
- [External APIs](#external-apis)
- [Contributors](#contributors)

# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/divisha-jn/HobbyHive.git
cd HobbyHive/sc2006-hobbyhive
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**\
The project uses a shared Supabase instance. The `.env.local` file with credentials is already included in the repository.


4. **Run the development server**
```bash
npm run dev
```


**And you are ready to start using the HobbyHive!**\
Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.


# Pre-configured Users

| Name    | Role  | Email                 | Password  |
| ------- | ----- | --------------------- | --------- |
| User1   | User  | user1@test.email.com  | HobbyHive |
| User2   | User  | user2@test.email.com  | HobbyHive |
| User3   | User  | user3@test.email.com  | HobbyHive |
| User4   | User  | user4@test.email.com  | HobbyHive |
| Admin1  | Admin | admin1@test.email.com | HobbyHive |
| Admin2  | Admin | admin2@test.email.com | HobbyHive |

# Documentation

All design, requirements, and technical documents for HobbyHive are available below:

- [Software Requirements Specification (SRS)](https://github.com/divisha-jn/HobbyHive/blob/main/Lab%205/Software%20Requirements%20Specification.pdf)
- [Supporting Documents](https://github.com/divisha-jn/HobbyHive/tree/main/Lab%205/Supporting%20Documents)
- [System & UML Diagrams](https://github.com/divisha-jn/HobbyHive/tree/main/Lab%205/Diagram%20Images)

  
## API Documentation 
Complete API documentation is available here: [API Documentation (API.md)](https://github.com/divisha-jn/HobbyHive/blob/main/sc2006-hobbyhive/app/docs/API.md)

## Database Schema
Database schema and explanation is available here: [Database Schema (DATABASE.md)](https://github.com/divisha-jn/HobbyHive/blob/main/sc2006-hobbyhive/app/docs/DATABASE.md)


# Design

## Overview

HobbyHive is a full-stack event management platform built with Next.js 14, Supabase, and modern web technologies. The application enables users to discover, host, and participate in community events across Singapore, with features including location-based event discovery, real-time chat, and admin moderation.

## Architecture

HobbyHive follows the Next.js App Router architecture with a clear separation between client and server components, API routes, and utility functions.

The frontend (Next.js + React) consists of different User Interfaces organized by user roles and features. The application uses Server-Side Rendering (SSR) and Client-Side Rendering (CSR) strategically for optimal performance.

## File Structure

```
📁 app/
├── 📁 admin/                    # Admin-only pages
│   ├── 📁 controllers/          # Admin logic controllers
│   ├── 📁 models/               # Admin data models
│   ├── 📁 moderate-events/      # Event moderation interface
│   ├── 📁 review-events/        # Event review interface
│   ├── 📁 review-users/         # User review interface
│   └── 📁 views/                # Admin view components
│
├── 📁 api/                      # Backend API Routes
│   ├── 📁 community-clubs/      # Fetch community club locations
│   ├── 📁 geocode/              # Location geocoding service
│   ├── 📁 libraries/            # Fetch library locations
│   ├── 📁 nearest-mrt/          # Find nearest MRT stations
│   └── 📁 parks/                # Fetch park locations
│
├── 📁 components/               # Reusable UI Components
│   ├── AuthWrapper.tsx          # Authentication wrapper
│   ├── FilterButton.tsx         # Event filtering component
│   ├── FollowersList.tsx        # User followers display
│   ├── Header.tsx               # App header
│   ├── LocationAutocompleteInput.tsx  # Location search
│   ├── LocationMapPicker.tsx    # Interactive map picker
│   └── Navbar.tsx               # Navigation bar
│
├── 📁 config/                   # Configuration Files
│   └── categoryLocationMapping.ts  # Event category to location mapping
│
├── 📁 docs/                    # Documentation Files
│   └── API.md                  # Complete API Documentation
│   └── DATABASE.md             # Complete Backend Documentation
│
├── 📁 error/                    # Error page
│   └── page.tsx                  
|
├── 📁 events/                   # Event Pages
│   ├── 📁 [id]/                 # Dynamic event detail page
│   └── page.tsx                 # Event listing page
│
├── 📁 groupchat/                # Real-time Chat Feature
│   ├── 📁 components/           # Chat UI components
│   ├── 📁 controllers/          # Chat logic
│   ├── 📁 model/                # Chat data models
│   └── page.tsx                 # Chat interface
│
├── 📁 host/                     # Event Host Features
│   ├── 📁 CreateEvent/          # Event creation interface
│   ├── 📁 EditCancel/           # Event edit/cancel interface
│   ├── 📁 components/           # Host-specific components
│   ├── 📁 controllers/          # Host logic
│   └── 📁 models/               # Host data models
│
├── 📁 login/                     # Login Page
│   ├── 📁 page.tsx         
|
├── 📁 my-events/                # User's Events Dashboard
│   └── page.tsx                 # Attending & hosting events
│
├── 📁 participant/[id]/         # Participant Profile Pages
│   └── page.tsx                 # Public user profile
│
├── 📁 profile/                  # User Profile Management
│   └── page.tsx                 # User's own profile
│
├── 📁 utils/                    # Utility Functions
│   ├── calculateNearestMRT.ts   # MRT calculation logic
│   └── oneMapTokenManager.ts    # OneMap API token management
│
└── page.tsx                     # Homepage

- `📁 public` Contains static assets including icons, images.
- `📁 utils/supabase` Contains Supabase client initialization for server-side and client-side components, along with middleware configuration.
```

## Software Engineering Practices
1. Clear Separation of Concerns (SoC) through MVC‐style Structure
2. Comprehensive and Structured Documentation
3. User stories for main functions
4. Scrum (2 week sprint cycle)


## Design Patterns

1. **`Facade Pattern`** via the Controllers (eg: refer app/admin/controllers or app/host/controllers).
2. **`Publisher-Subscriber Pattern`** for real-time text messaging communication between different users (eg: refer app/groupchat).
3. **`Singleton Pattern`** as token caching ensures only one active OneMap token exists at a time (eg: refer app/utils/oneMapTokenManager.ts).


## SOLID Principles

1. **`Single Responsibility Principle (SRP)`**
    Each module has one clearly defined responsibility.
   (eg: app/api/nearest-mrt/route.ts - Only handles MRT station lookups)
2. **`Open-Closed Principle (OCP)`**
   The application is open for extension but closed for modification.
   (eg: app/config/categoryLocationMapping.ts - New event categories can be added without modifying existing code)
3. **`Liskov Substitution Principle (LSP)`**
   TypeScript interfaces ensure objects can be substituted without breaking functionality.
   (eg: Event objects from different sources (hosted/attending) use the same Event interface)
4. **`Interface Segregation Principle (ISP)`**
   Specific, focused interfaces are used instead of large, monolithic ones.
   (eg: Modular folder structure like app/host and app/participant ensures each module has access only to necessary information)

## Tech Stack

**Frontend:**

- Next.js
- TypeScript
- TailWindCSS
- DaisyUI

**Backend:**

- supabase

**Hosting:**

- Vercel


# External APIs

1. **Singapore's OneMap API**
   1. Map Tiles - https://www.onemap.gov.sg/docs/maps/
   2. Search/Geocoding - https://www.onemap.gov.sg/api/common/elastic/search
   3. Nearest MRT Stations - https://www.onemap.gov.sg/api/public/nearbysvc/getNearestMrtStops
2. **data.gov.sg Open Datasets**
   1. Parks GeoJson - https://data.gov.sg/datasets/d_0542d48f0991541706b58059381a6eca/view
   2. Community Clubs GeoJson - https://data.gov.sg/datasets/d_f706de1427279e61fe41e89e24d440fa/view
   3. Libraries GeoJson - https://data.gov.sg/datasets/d_27b8dae65d9ca1539e14d09578b17cbf/view
3. **Leaflet.js (Open-Source Mapping Library)**
   1. Documentation - https://leafletjs.com

# Contributors

The following contributors have contributed to the whole Software Developement Life-cycle, including (not exhausive):

1. Ideation and refinement
2. Generation of functional and non-funtional requirements
3. Generation of Use Cases and Descriptions
4. UI/UX Mockup and Prototyping (Figma)
5. Design of Architecture Diagram, Class Diagram, Sequence Diagrams, and Dialog Map Diagram
6. Development of Application
7. Black-box and White-box Testing
8. Documentations

| Name                   | Github Username                               |
| ---------------------- | --------------------------------------------- |
| Teo Rong Xuan          | [RongXuaan](https://github.com/RongXuaan)     |
| Jain Divisha           | [divisha-jn](https://github.com/divisha-jn)   |
| Chua Jing Yi Jax       | [JaxChuaJY](https://github.com/JaxChuaJY)     |
| Ishita Dhananjaya      | [ishxtaa](https://github.com/ishxtaa)         |
| Palagiri Afreen Mahtaj | [afreen-code](https://github.com/afreen-code) |
| Swetha Sudhakar        | [Swetha-aaa](https://github.com/Swetha-aaa)   |
