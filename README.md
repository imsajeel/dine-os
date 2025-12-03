<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="ui/logo/dine-os-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="ui/logo/dine-os-light.png">
    <img alt="DineOS Logo" src="ui/logo/dine-os-light.png" width="200">
  </picture>
</div>

# DineOS

DineOS is a comprehensive restaurant operating system designed to manage multiple branches, menus, orders, and reservations. It consists of a backend API, an admin dashboard, and a POS (Point of Sale) system.

## Project Structure

- **`backend`**: NestJS application serving as the core API. Handles database interactions (Prisma/PostgreSQL), authentication, and business logic.
- **`admin-dashboard`**: Next.js application for restaurant administrators to manage branches, menus, staff, and view analytics.
- **`pos-system`**: React/Next.js application for the Point of Sale interface, used by staff to take orders.

## Features

- **Multi-Branch Support**: Manage multiple restaurant branches under a single organization.
- **Menu Management**: Create and manage categories, items, and modifiers. Support for branch-specific menu overrides.
- **Order Management**: Real-time order tracking for Dine-in and Takeaway.
- **Real-time Updates**: Uses WebSockets (Socket.IO) for instant updates on orders and menu changes across devices.
- **"Per Kg" Pricing**: Special support for weight-based items (e.g., fresh fish) with dynamic pricing calculations.
- **Staff Management**: Role-based access control for admins, managers, and staff.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd restro-os
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Configure .env file with DATABASE_URL and other secrets
    npx prisma generate
    npx prisma migrate deploy
    npm run start:dev
    ```

3.  **Admin Dashboard Setup:**
    ```bash
    cd admin-dashboard
    npm install
    npm run dev
    ```

4.  **POS System Setup:**
    ```bash
    cd pos-system
    npm install
    npm run dev
    ```

## Technologies Used

- **Backend**: NestJS, Prisma, PostgreSQL, Socket.IO
- **Frontend**: Next.js, React, Tailwind CSS, Lucide React
- **Authentication**: JWT

## License

[License Name]
