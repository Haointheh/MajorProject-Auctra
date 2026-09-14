# Auctra

Auctra is a full-stack online auction platform built with FastAPI on the backend and React + Vite on the frontend. The system supports seller onboarding, buyer bidding, KYC verification, collateral-based entry checks, AI-powered fraud risk evaluation, payment flows, real-time notifications, and admin moderation.

## Project overview

This repository contains the complete code for a digital auction marketplace where:

- sellers can create and manage auctions
- buyers can browse live and upcoming auctions
- users must complete KYC before participating in bidding or selling
- bidders deposit collateral before bidding, with risk-based eligibility checks
- auctions resolve automatically and payment deadlines are enforced
- real-time notifications are pushed to connected users through WebSockets
- admins can review users and monitor the auction system

## Key features

- Secure authentication and role-based access control
- OTP-based signup flow with KYC completion
- Auction creation, update, image upload, and status tracking
- Search and browse capabilities for auctions
- Live bidding with minimum bid validation and collateral enforcement
- AI-based risk assessment and collateral estimation using XGBoost and Isolation Forest models
- Payment completion and cascade logic for failed or overdue payments
- Real-time countdown and notification updates
- Seller, bidder, and admin dashboards
- KYC approval, blocking, and account management

## Tech stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT-based authentication
- APScheduler for automated auction and payment jobs
- WebSockets for live updates
- Pydantic schemas for validation

### Frontend

- React
- Vite
- React Router
- Axios for API calls
- Zustand for state management
- custom UI components and real-time socket hooks

### AI / risk engine

- XGBoost model
- Isolation Forest model
- custom scoring pipeline in the ai and ML assets folder

## Repository structure

- backend/: FastAPI application, routes, database models, services, and auth logic
- frontend/: React frontend app and route structure
- ai/: model artifacts, notebooks, datasets, and ML experimentation files
- README.md: project overview and setup instructions

## Backend architecture

The backend is organized around a set of FastAPI routers and service modules:

- routes/auth_routes.py: login, signup, OTP verification, and KYC flow
- routes/auction_routes.py: auction listing, creation, updates, and lifecycle actions
- routes/bidding_routes.py: bid placement and validation
- routes/collateral_routes.py: collateral deposits and AI risk checks
- routes/dashboard_routes.py: bidder, seller, and admin dashboard data
- routes/notification_routes.py: notification retrieval and marking as read
- routes/websocket_routes.py: live notifications and auction room streams
- services/: automated jobs and resolution logic for auctions, payments, and notifications
- model.py: database schema for users, auctions, bids, collateral, risk assessments, and notifications

## Frontend architecture

The frontend uses a route-based app layout:

- Public routes: homepage, auction listing, public auction details, browse pages, and profile pages
- Seller routes: seller-specific dashboard and auction management views
- Admin routes: admin dashboard and user moderation screens
- State is managed via Zustand stores with live updates from notification sockets

## Environment variables

Create a .env file in the backend folder with the following values:

- DATABASE_URL=your_postgresql_connection_string
- JWT_SECRET_KEY=your_secret_key
- JWT_ALGORITHM=HS256
- JWT_EXPIRE_MINUTES=60
- EMAIL_ADDRESS=your_email_address
- EMAIL_PASSWORD=your_email_app_password
- ML_DIR=optional_path_to_the_ml_model_folder

The backend also expects the database to be reachable from the configured PostgreSQL URL.

## Prerequisites

- Python 3.10+ recommended
- Node.js 18+ and npm
- PostgreSQL database
- SMTP-capable email account for OTP sending
- ML model directory or configured ML_DIR path for the AI risk engine

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
```

Then start the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The Swagger documentation is available at:

- http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will usually run at:

- http://localhost:5173

### 3. Create admin user

A helper script is included to create an initial admin account:

```bash
cd backend
python create_admin.py
```

Default local admin credentials from the script:

- email: admin@auctra.com
- password: adminpass123

## Local workflow

1. Start PostgreSQL and configure DATABASE_URL.
2. Start the backend API.
3. Start the frontend app.
4. Sign up as a new user and complete KYC.
5. Use the approved seller flow to create auctions.
6. Bid on live auctions after KYC approval and collateral deposit.
7. Review dashboard data and notifications as the workflow progresses.

## Main API behaviors

- /login: authenticates users with role and KYC checks
- /signup/request: sends OTP to a new user
- /signup/verify: verifies the OTP and returns a signup token
- /signup/complete: creates the user and KYC document together
- /auctions: list auctions and fetch details
- /auctions/{auction_id}/bids: create and retrieve bids
- /auctions/{auction_id}/collateral: deposit collateral and run risk evaluation
- /notifications/me: fetch user notifications
- /ws/notifications and /ws/auctions/{auction_id}: live WebSocket updates

## Automated jobs

The backend runs scheduled tasks to manage the live auction lifecycle:

- closed auction resolution
- payment reminder dispatch
- overdue payment cascades
- ending-soon notifications
- countdown broadcasting

These jobs are scheduled in main.py using APScheduler.

## Notes

This project is designed as a real marketplace workflow rather than a toy demo. KYC, collateral, AI risk scoring, and transaction state handling are integrated into the core business flow to simulate a production-ready auction platform.

## License

This project is intended for academic and portfolio use. Please confirm the licensing terms before deploying or reusing it in a production environment.
