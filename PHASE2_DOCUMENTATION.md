# Phase 2 - Backend & Data Models Documentation

## Overview

Phase 2 extends the Phase 1 Analytics Engine into a full-featured backend with user authentication, data persistence, and comprehensive APIs for managing users, properties, and deals.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                        │
├─────────────────────────────────────────────────────────────┤
│  API Routes Layer                                            │
│  ├── Auth (register, login)                                 │
│  ├── Users (profile, list)                                  │
│  ├── Properties (CRUD)                                       │
│  ├── Deals (CRUD + analytics integration)                 │
│  ├── Admin (admin-only endpoints)                          │
│  └── Analytics (Phase 1 endpoints - still available)       │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                        │
│  ├── Core Analytics (Phase 1 - unchanged)                    │
│  ├── Security (JWT, password hashing)                        │
│  └── Dependencies (auth, authorization)                       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ├── SQLAlchemy Models (User, Property, Deal)               │
│  ├── Pydantic Schemas (request/response validation)         │
│  └── Database Session Management                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                   PostgreSQL Database
```

### Directory Structure

```
app/
├── main.py                    # FastAPI app entrypoint
├── core/
│   ├── analytics.py          # Phase 1 analytics (unchanged)
│   ├── assumptions.py        # Phase 1 assumptions (unchanged)
│   ├── config.py              # Application configuration
│   ├── security.py            # JWT & password hashing
│   └── dependencies.py        # Auth dependencies
├── db/
│   └── base.py               # Database session & base
├── models/                    # SQLAlchemy models
│   ├── user.py
│   ├── property.py
│   └── deal.py
├── schemas/                   # Pydantic schemas
│   ├── user.py
│   ├── property.py
│   └── deal.py
└── api/
    ├── routes_auth.py         # Authentication
    ├── routes_users.py        # User management
    ├── routes_properties.py   # Property CRUD
    ├── routes_deals.py        # Deal CRUD + analytics
    ├── routes_admin.py       # Admin endpoints
    └── routes_analytics.py    # Phase 1 analytics (unchanged)

alembic/                       # Database migrations
tests/                         # Test suite
```

## Database Models

### User Model

```python
- id: Integer (PK)
- email: String (unique, indexed)
- hashed_password: String
- full_name: String
- role: Enum (investor, realtor, admin)
- created_at: DateTime
- updated_at: DateTime
```

**Relationships:**
- One-to-many with Properties
- One-to-many with Deals

### Property Model

```python
- id: Integer (PK)
- owner_user_id: Integer (FK -> User)
- address_line1: String
- address_line2: String (optional)
- city: String
- state: String
- zip_code: String
- country: String (default: "USA")
- property_type: Enum (single_family, multi_family, condo, townhouse, other)
- bedrooms: Integer
- bathrooms: Integer
- square_feet: Integer
- year_built: Integer (optional)
- created_at: DateTime
- updated_at: DateTime
```

**Relationships:**
- Many-to-one with User (owner)
- One-to-many with Deals

### Deal Model

```python
- id: Integer (PK)
- user_id: Integer (FK -> User)
- property_id: Integer (FK -> Property, optional)
- purchase_price: Float
- down_payment: Float
- interest_rate: Float
- loan_term_years: Integer
- monthly_rent: Float
- property_tax_annual: Float (nullable)
- insurance_annual: Float (nullable)
- hoa_monthly: Float (nullable)
- maintenance_percent: Float
- vacancy_percent: Float
- management_percent: Float
- notes: Text (optional)
- snapshot_of_assumptions: JSON (nullable)
- snapshot_of_analytics_result: JSON (nullable)
- created_at: DateTime
- updated_at: DateTime
```

**Relationships:**
- Many-to-one with User (deal owner)
- Many-to-one with Property (optional)

**Key Features:**
- `snapshot_of_assumptions`: Stores the assumptions used at calculation time
- `snapshot_of_analytics_result`: Stores complete analytics results (cash flow, DSCR, deal analysis)

## Authentication & Authorization

### JWT Authentication

- **Token Type:** Bearer token
- **Algorithm:** HS256
- **Expiration:** Configurable (default: 30 minutes)
- **Token Payload:** `{"sub": user_id, "email": user_email, "exp": expiration}`

### Authorization Rules

1. **Users can only access their own data:**
   - Properties: Only see properties they own
   - Deals: Only see deals they created
   - Exception: Admins can see all data

2. **Admin Role:**
   - Can access all users, properties, and deals
   - Has access to `/api/v1/admin/*` endpoints

### Security Features

- Password hashing using bcrypt
- JWT token validation
- Role-based access control
- Ownership validation on all operations

## API Endpoints

### Authentication

#### `POST /api/v1/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "role": "investor"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "investor",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### `POST /api/v1/auth/login`
Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### User Management

#### `GET /api/v1/users/me`
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "investor",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### `GET /api/v1/users` (Admin only)
List all users with pagination.

**Query Parameters:**
- `skip`: Offset (default: 0)
- `limit`: Page size (default: 100, max: 100)

### Property Management

#### `POST /api/v1/properties`
Create a new property.

**Request:**
```json
{
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "USA",
  "property_type": "single_family",
  "bedrooms": 3,
  "bathrooms": 2,
  "square_feet": 1500,
  "year_built": 1990
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "owner_user_id": 1,
  "address_line1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "property_type": "single_family",
  "bedrooms": 3,
  "bathrooms": 2,
  "square_feet": 1500,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### `GET /api/v1/properties`
List properties (user's own or all if admin).

**Query Parameters:**
- `skip`: Offset
- `limit`: Page size

#### `GET /api/v1/properties/{property_id}`
Get a specific property.

#### `PUT /api/v1/properties/{property_id}`
Update a property.

#### `DELETE /api/v1/properties/{property_id}`
Delete a property.

### Deal Management

#### `POST /api/v1/deals`
Create a new deal and calculate analytics.

**Request:**
```json
{
  "property_id": 1,
  "purchase_price": 250000,
  "down_payment": 50000,
  "interest_rate": 5.0,
  "loan_term_years": 30,
  "monthly_rent": 2200,
  "property_tax_annual": 3000,
  "insurance_annual": 1200,
  "hoa_monthly": 150,
  "maintenance_percent": 8,
  "vacancy_percent": 5,
  "management_percent": 8,
  "notes": "Great investment opportunity",
  "assumptions": {
    "vacancy_percent": 5.0,
    "maintenance_percent": 8.0,
    "management_percent": 8.0
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "property_id": 1,
  "purchase_price": 250000,
  "down_payment": 50000,
  "monthly_rent": 2200,
  "snapshot_of_assumptions": {
    "vacancy_percent": 5.0,
    "maintenance_percent": 8.0,
    "management_percent": 8.0,
    "property_tax_percent": 1.2,
    "insurance_percent": 0.6
  },
  "snapshot_of_analytics_result": {
    "cash_flow": {
      "monthly_cash_flow": 450.25,
      "annual_cash_flow": 5403.00,
      "noi_annual": 18000.00,
      "monthly_debt_service": 1073.75,
      "cash_on_cash_return": 10.81,
      "summary": "NOI: $1,500.00/mo | Debt Service: $1,073.75/mo | Cash Flow: $450.25/mo | Cash-on-Cash: 10.81%"
    },
    "dscr": {
      "dscr": 1.40,
      "interpretation": "Healthy coverage"
    },
    "deal_analysis": {
      "overall_score": 75.0,
      "label": "Strong Deal",
      "reasons": [
        "Monthly cash flow exceeds $300",
        "DSCR above 1.25 indicates strong coverage"
      ]
    }
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Key Features:**
- Automatically calculates analytics on creation
- Stores assumptions snapshot
- Stores complete analytics results

#### `GET /api/v1/deals`
List deals (user's own or all if admin).

#### `GET /api/v1/deals/{deal_id}`
Get a specific deal with analytics snapshot.

#### `PUT /api/v1/deals/{deal_id}`
Update a deal and recalculate analytics.

#### `POST /api/v1/deals/{deal_id}/recalculate`
Recalculate analytics using latest assumptions.

#### `DELETE /api/v1/deals/{deal_id}`
Delete a deal.

### Admin Endpoints

#### `GET /api/v1/admin/deals`
List all deals (admin only).

#### `GET /api/v1/admin/properties`
List all properties (admin only).

## Analytics Integration

### How Analytics Are Integrated

When a deal is created or updated, the system:

1. **Prepares inputs** from the deal data and assumptions
2. **Calls Phase 1 analytics functions:**
   - `calculate_cash_flow()`
   - `calculate_dscr()`
   - `analyze_deal()`
3. **Stores results** in `snapshot_of_analytics_result` JSON field
4. **Stores assumptions** in `snapshot_of_assumptions` JSON field

### Analytics Snapshot Structure

```json
{
  "cash_flow": {
    "monthly_cash_flow": 450.25,
    "annual_cash_flow": 5403.00,
    "noi_annual": 18000.00,
    "monthly_debt_service": 1073.75,
    "cash_on_cash_return": 10.81,
    "summary": "..."
  },
  "dscr": {
    "dscr": 1.40,
    "interpretation": "Healthy coverage"
  },
  "deal_analysis": {
    "overall_score": 75.0,
    "label": "Strong Deal",
    "reasons": ["...", "..."],
    "cash_flow": {...},
    "dscr": {...}
  }
}
```

## Database Migrations

### Setup Alembic

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize database:**
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

3. **Create new migration:**
   ```bash
   alembic revision --autogenerate -m "Description"
   alembic upgrade head
   ```

## Testing

### Test Structure

- `tests/test_auth.py` - Authentication tests
- `tests/test_deals_api.py` - Deal API tests with analytics
- `tests/test_analytics.py` - Phase 1 analytics tests (unchanged)
- `tests/test_api.py` - Phase 1 API tests (unchanged)

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/
```

### Test Database

Tests use SQLite in-memory database configured in `tests/conftest.py`.

## Configuration

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/brightsteps
SECRET_KEY=your-secret-key-change-in-production
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Settings

Configuration is managed in `app/core/config.py` using Pydantic Settings.

## React Frontend Integration (Phase 3)

### Response Format

All responses follow a React-friendly structure:

```json
{
  "data": {
    // Main resource data
  },
  "meta": {
    // Pagination info (for lists)
    "skip": 0,
    "limit": 100,
    "total": 50
  },
  "errors": []
}
```

### Authentication Flow

1. **Register/Login:**
   ```javascript
   const response = await fetch('/api/v1/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { access_token } = await response.json();
   localStorage.setItem('token', access_token);
   ```

2. **Authenticated Requests:**
   ```javascript
   const response = await fetch('/api/v1/deals', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     }
   });
   ```

### TypeScript Interfaces

TypeScript interfaces are available in `types/interfaces.ts` and can be extended for Phase 2 models.

## Next Steps (Phase 3)

1. **Frontend Development:**
   - React components for authentication
   - Property management UI
   - Deal creation/editing forms
   - Analytics visualization

2. **Enhancements:**
   - File uploads for property images
   - Email notifications
   - Advanced search/filtering
   - Export functionality
   - Real-time updates (WebSockets)

3. **Mobile App:**
   - React Native app using same APIs
   - Offline support
   - Push notifications

## Notes

- Phase 1 analytics endpoints remain available at `/api/v1/calculate/*` and `/api/v1/analyze/*`
- All Phase 1 functionality is preserved and integrated
- Analytics calculations are pure functions (no side effects)
- Database models are designed for future extensibility
- Authorization is enforced at the API layer

