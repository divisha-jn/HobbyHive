# HobbyHive 🎨

Welcome to the official repository for NTU SC2006 Software Engineering group project **_HobbyHive_**.

<p align='center'>
  <img src="/sc2006-hobbyhive/public/card.png" width=600 />
</p>

<p align="center">
    <a href="https://github.com/ishxtaa/2006-SCSC-108/tree/main/sc2006-hobbyhive">Code</a>
    |
    <a href="">Demo Video</a>
</p>

HobbyHive believes in **connecting people** through shared experiences. Our platform empowers communities to **discover, host, and manage events,** from local gatherings to large-scale activities, all in one place.

This project applied **software engineering best practices** and **design patterns** to ensure high reliability, performance, and extensibility for future enhancements.


<br>

**Table of Contents**

- [HobbyHive](#hobbyhive-)
- [Setup Instructions](#setup-instructions)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Pre-configured Users](#pre-configured-users)
- [Documentation](#documentation)
- [API Docs](#api-docs)
  - [API Endpoints](#api-endpoints)
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

## Frontend

1. In the `/frontend` directory, install the required node modules.

```bash
npm install
```

2. Start the application.

```bash
npm run dev
```

And you are ready to start using the FeedItForward Frontend! The frontend application is running on http://localhost:3000/

## Backend

1. In the `/backend` directory, create a python virtual environment and activate it.

```bash
python -m venv .venv
. .venv/Scripts/activate # The .venv activation command might differ depending on your operating system
```

2. Install the required packages.

```bash
pip install -r requirements.txt
```

3. In the `/backend/app` directory, start the application.

```bash
cd app
uvicorn main:app --reload
```



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



# Design

## Overview

HobbyHive is a full-stack event management platform built with Next.js 14, Supabase, and modern web technologies. The application enables users to discover, host, and participate in community events across Singapore, with features including location-based event discovery, real-time chat, and admin moderation.

## Architecture

HobbyHive follows the Next.js App Router architecture with a clear separation between client and server components, API routes, and utility functions.

The frontend (Next.js + React) consists of different User Interfaces organized by user roles and features. The application uses Server-Side Rendering (SSR) and Client-Side Rendering (CSR) strategically for optimal performance.

## File Structure

- `📁 app/admin` Contains admin only pages.
- `📁 app/api` Contains API routes.
- `📁 app/components` Contains reusable UI components.
- `📁 app/config` Contains configuration files.
- `📁 app/groupchat` Contains real-time chat features.
- `📁 app/host` Contains event host features.
- `📁 app/my-events` Contains user's events dashboard.
- `📁 app/participant/[id]` Contains other user's profile pages.
- `📁 app/profile` Contains user's profile management.
- `📁 app/utils` Contains utility functions.
- `📁 app/page.tsx` Contains Homepage.
- `📁 public` Contains static assets including icons, images.
- `📁 utils/supabase` Contains Supabase client initialization for server-side and client-side components, along with middleware configuration.


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
