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

## Design Logic

### 1. Data Scoping & Multi-Tenancy
DineOS uses a hierarchical data scoping strategy:
- **Organization Level**: The top-level entity. All data (Menus, Users, Tables) belongs to an Organization.
- **Branch Level**: A subset of the Organization. Orders and Tables are strictly scoped to a Branch.
- **Menu Overrides**: Menus can be defined globally (Organization level) or overridden per Branch. The system prioritizes Branch-specific items over Global items during retrieval.

### 2. "Per Kg" Pricing Architecture
For items sold by weight (e.g., fresh seafood, steaks), DineOS implements a specific pricing logic:
- **Modifier Group Type**: A special `grams` type modifier group is used.
- **Rate Definition**: The base price of the Menu Item acts as the **Rate per Kg**.
- **Calculation**: `Price = (Input Weight in Grams / 1000) * Item Base Price`.
- **UI Handling**: The POS detects the `grams` type and renders a weight input field instead of standard selection options.

### 3. Real-time Event Architecture
To ensure instant synchronization across multiple POS terminals and the Kitchen Display System (KDS):
- **WebSockets (Socket.IO)**: Used for bi-directional communication.
- **Event Flow**:
    1.  **Action**: POS creates an order.
    2.  **Emit**: Backend processes order and emits `order_created` event to the specific Organization room.
    3.  **Update**: All connected clients (other POS, Admin Dashboard) listen for the event and refetch relevant data immediately, eliminating the need for polling.

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
