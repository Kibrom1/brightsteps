# BrightSteps API Specification

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/api/v1/auth/login` endpoint.

---

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "investor"  // Optional: "investor" | "realtor" | "admin"
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

### POST /api/v1/auth/login

Login and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## User Endpoints

### GET /api/v1/users/me

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

### GET /api/v1/users

List all users (admin only).

**Query Parameters:**
- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 100, max: 100) - Page size

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "investor",
    ...
  }
]
```

---

## Property Endpoints

### POST /api/v1/properties

Create a new property.

**Request Body:**
```json
{
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",  // Optional
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "USA",  // Optional, default: "USA"
  "property_type": "single_family",  // "single_family" | "multi_family" | "condo" | "townhouse" | "other"
  "bedrooms": 3,
  "bathrooms": 2.5,
  "square_feet": 1500,
  "year_built": 1990  // Optional
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
  "bathrooms": 2.5,
  "square_feet": 1500,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### GET /api/v1/properties

List properties (user's own, or all if admin).

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)

**Response:** `200 OK` - Array of Property objects

### GET /api/v1/properties/{property_id}

Get a specific property.

**Response:** `200 OK` - Property object

### PUT /api/v1/properties/{property_id}

Update a property.

**Request Body:** Partial PropertyUpdate object

**Response:** `200 OK` - Updated Property object

### DELETE /api/v1/properties/{property_id}

Delete a property.

**Response:** `204 No Content`

---

## Deal Endpoints

### POST /api/v1/deals

Create a new deal and calculate analytics.

**Request Body:**
```json
{
  "property_id": 1,  // Optional
  "purchase_price": 350000,
  "down_payment": 70000,
  "interest_rate": 6.5,
  "loan_term_years": 30,
  "monthly_rent": 2800,
  "property_tax_annual": 4200,  // Optional (will use assumptions if not provided)
  "insurance_annual": 1800,  // Optional (will use assumptions if not provided)
  "hoa_monthly": 200,  // Optional
  "maintenance_percent": 8,
  "vacancy_percent": 5,
  "management_percent": 10,
  "notes": "Great investment opportunity"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 1,
  "property_id": 1,
  "purchase_price": 350000,
  "down_payment": 70000,
  "monthly_rent": 2800,
  "snapshot_of_assumptions": {
    "vacancy_percent": 5.0,
    "maintenance_percent": 8.0,
    "management_percent": 10.0,
    "property_tax_percent": 1.2,
    "insurance_percent": 0.6,
    "appreciation_percent_annual": 3.0,
    "rent_growth_percent_annual": 2.5
  },
  "snapshot_of_analytics_result": {
    "cash_flow": {
      "monthly_cash_flow": 523.45,
      "annual_cash_flow": 6281.40,
      "noi_annual": 25200.00,
      "monthly_debt_service": 1768.55,
      "cash_on_cash_return": 8.97,
      "summary": "NOI: $2,100.00/mo | Debt Service: $1,768.55/mo | Cash Flow: $523.45/mo | Cash-on-Cash: 8.97%"
    },
    "dscr": {
      "dscr": 1.19,
      "interpretation": "Borderline"
    },
    "deal_analysis": {
      "overall_score": 70.0,
      "label": "Strong Deal",
      "reasons": [
        "Monthly cash flow exceeds $300",
        "DSCR above 1.1 is acceptable"
      ]
    }
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### GET /api/v1/deals

List deals (user's own, or all if admin).

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)

**Response:** `200 OK` - Array of Deal objects

### GET /api/v1/deals/{deal_id}

Get a specific deal with analytics.

**Response:** `200 OK` - Deal object with analytics snapshot

### PUT /api/v1/deals/{deal_id}

Update a deal and recalculate analytics.

**Request Body:** Partial DealUpdate object

**Response:** `200 OK` - Updated Deal object with recalculated analytics

### POST /api/v1/deals/{deal_id}/recalculate

Recalculate deal analytics using latest assumptions.

**Response:** `200 OK` - Deal object with updated analytics

### DELETE /api/v1/deals/{deal_id}

Delete a deal.

**Response:** `204 No Content`

---

## Analytics Endpoints (Phase 1)

These endpoints are still available and don't require authentication.

### POST /api/v1/calculate/cap-rate

Calculate cap rate.

**Request Body:**
```json
{
  "purchase_price": 200000,
  "annual_rent": 24000,
  "annual_expenses": 6000
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "cap_rate": 9.0,
    "noi": 18000,
    "annual_rent": 24000,
    "annual_expenses": 6000
  }
}
```

### POST /api/v1/calculate/cash-flow

Calculate detailed cash flow.

**Request Body:**
```json
{
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
  "management_percent": 8
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "monthly_cash_flow": 450.25,
    "annual_cash_flow": 5403.00,
    "noi_annual": 18000.00,
    "monthly_debt_service": 1073.75,
    "cash_on_cash_return": 10.81,
    "summary": "NOI: $1,500.00/mo | Debt Service: $1,073.75/mo | Cash Flow: $450.25/mo | Cash-on-Cash: 10.81%"
  }
}
```

### POST /api/v1/calculate/dscr

Calculate DSCR (Debt Service Coverage Ratio).

**Request Body:**
```json
{
  "noi_annual": 30000,
  "annual_debt_service": 25000
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "dscr": 1.2,
    "interpretation": "Borderline"
  }
}
```

### POST /api/v1/estimate/rent

Estimate market rent.

**Request Body:**
```json
{
  "bedrooms": 3,
  "bathrooms": 2,
  "square_feet": 1500,
  "zip_code": "90210",
  "property_type": "single_family"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "estimated_rent": 2250.0,
    "assumptions": {
      "base_rent_per_sqft": 1.2,
      "bedroom_multiplier": 75.0,
      "bathroom_multiplier": 50.0,
      "property_type_adjustment": 1.0,
      "zip_code_used": false
    }
  }
}
```

### GET /api/v1/assumptions

Get current default assumptions.

**Response:** `200 OK`
```json
{
  "data": {
    "vacancy_percent": 5.0,
    "maintenance_percent": 8.0,
    "management_percent": 8.0,
    "property_tax_percent": 1.2,
    "insurance_percent": 0.6,
    "appreciation_percent_annual": 3.0,
    "rent_growth_percent_annual": 2.5
  }
}
```

### PUT /api/v1/assumptions

Update default assumptions.

**Request Body:**
```json
{
  "vacancy_percent": 4.0,
  "maintenance_percent": 7.0,
  "management_percent": 7.0,
  "property_tax_percent": 1.2,
  "insurance_percent": 0.6,
  "appreciation_percent_annual": 3.0,
  "rent_growth_percent_annual": 2.5
}
```

**Response:** `200 OK` - Updated assumptions

### POST /api/v1/analyze/deal

Analyze a deal (rule-based scoring).

**Request Body:**
```json
{
  "purchase_price": 300000,
  "down_payment": 60000,
  "monthly_rent": 2500,
  "interest_rate": 4.5,
  "loan_term_years": 30,
  "hoa_monthly": 0,
  "assumptions": {  // Optional
    "vacancy_percent": 4.0,
    "maintenance_percent": 7.0,
    "management_percent": 7.0
  }
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "overall_score": 75.0,
    "label": "Strong Deal",
    "reasons": [
      "Monthly cash flow exceeds $300",
      "DSCR above 1.25 indicates strong coverage"
    ],
    "cash_flow": { ... },
    "dscr": { ... }
  }
}
```

---

## Admin Endpoints

### GET /api/v1/admin/deals

List all deals (admin only).

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)

**Response:** `200 OK` - Array of Deal objects

### GET /api/v1/admin/properties

List all properties (admin only).

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 100)

**Response:** `200 OK` - Array of Property objects

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error message",
      "type": "value_error"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Response Format

### Phase 1 Analytics Endpoints
Return data wrapped in `ResponseEnvelope`:
```json
{
  "data": { ... },
  "warnings": null,
  "errors": null
}
```

### Phase 2 Endpoints (Users, Properties, Deals)
Return data directly:
```json
{
  "id": 1,
  "email": "user@example.com",
  ...
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

---

## Versioning

Current API version: `v1`

All endpoints are under `/api/v1/`

---

## Interactive Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can:
- See all endpoints
- Try requests directly
- View request/response schemas
- Test authentication

Visit http://localhost:8000/redoc for alternative ReDoc documentation.

