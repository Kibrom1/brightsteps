# Phase 2 - Example API Requests & Responses

## Authentication Examples

### 1. Register User

**Request:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "investor@example.com",
  "password": "securepass123",
  "full_name": "Jane Investor",
  "role": "investor"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "investor@example.com",
  "full_name": "Jane Investor",
  "role": "investor",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### 2. Login

**Request:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "investor@example.com",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiaW52ZXN0b3JAZXhhbXBsZS5jb20iLCJleHAiOjE3MDUzMjE4MDB9.signature",
  "token_type": "bearer"
}
```

## Property Examples

### 3. Create Property

**Request:**
```bash
POST /api/v1/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "address_line1": "456 Oak Avenue",
  "address_line2": "Unit 2B",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90001",
  "country": "USA",
  "property_type": "condo",
  "bedrooms": 2,
  "bathrooms": 1,
  "square_feet": 1200,
  "year_built": 2010
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "owner_user_id": 1,
  "address_line1": "456 Oak Avenue",
  "address_line2": "Unit 2B",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90001",
  "country": "USA",
  "property_type": "condo",
  "bedrooms": 2,
  "bathrooms": 1,
  "square_feet": 1200,
  "year_built": 2010,
  "created_at": "2024-01-15T10:35:00",
  "updated_at": "2024-01-15T10:35:00"
}
```

### 4. List Properties

**Request:**
```bash
GET /api/v1/properties?skip=0&limit=10
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "owner_user_id": 1,
    "address_line1": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "property_type": "condo",
    "bedrooms": 2,
    "bathrooms": 1,
    "square_feet": 1200,
    "created_at": "2024-01-15T10:35:00",
    "updated_at": "2024-01-15T10:35:00"
  }
]
```

## Deal Examples

### 5. Create Deal (with Analytics)

**Request:**
```bash
POST /api/v1/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "purchase_price": 350000,
  "down_payment": 70000,
  "interest_rate": 6.5,
  "loan_term_years": 30,
  "monthly_rent": 2800,
  "property_tax_annual": 4200,
  "insurance_annual": 1800,
  "hoa_monthly": 200,
  "maintenance_percent": 8,
  "vacancy_percent": 5,
  "management_percent": 10,
  "notes": "Great location, high rental demand"
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
  "interest_rate": 6.5,
  "loan_term_years": 30,
  "monthly_rent": 2800,
  "property_tax_annual": 4200,
  "insurance_annual": 1800,
  "hoa_monthly": 200,
  "maintenance_percent": 8,
  "vacancy_percent": 5,
  "management_percent": 10,
  "notes": "Great location, high rental demand",
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
      ],
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
      }
    }
  },
  "created_at": "2024-01-15T10:40:00",
  "updated_at": "2024-01-15T10:40:00"
}
```

### 6. Get Deal with Analytics

**Request:**
```bash
GET /api/v1/deals/1
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "property_id": 1,
  "purchase_price": 350000,
  "down_payment": 70000,
  "monthly_rent": 2800,
  "snapshot_of_analytics_result": {
    "cash_flow": {
      "monthly_cash_flow": 523.45,
      "annual_cash_flow": 6281.40,
      "noi_annual": 25200.00,
      "monthly_debt_service": 1768.55,
      "cash_on_cash_return": 8.97
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
  "created_at": "2024-01-15T10:40:00",
  "updated_at": "2024-01-15T10:40:00"
}
```

### 7. Update Deal (Triggers Recalculation)

**Request:**
```bash
PUT /api/v1/deals/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "monthly_rent": 3000
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "property_id": 1,
  "purchase_price": 350000,
  "down_payment": 70000,
  "monthly_rent": 3000,
  "snapshot_of_analytics_result": {
    "cash_flow": {
      "monthly_cash_flow": 723.45,
      "annual_cash_flow": 8681.40,
      "noi_annual": 28800.00,
      "monthly_debt_service": 1768.55,
      "cash_on_cash_return": 12.40
    },
    "dscr": {
      "dscr": 1.36,
      "interpretation": "Healthy coverage"
    },
    "deal_analysis": {
      "overall_score": 90.0,
      "label": "Strong Deal",
      "reasons": [
        "Monthly cash flow exceeds $300",
        "DSCR above 1.25 indicates strong coverage"
      ]
    }
  },
  "updated_at": "2024-01-15T11:00:00"
}
```

### 8. Recalculate Deal Analytics

**Request:**
```bash
POST /api/v1/deals/1/recalculate
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "snapshot_of_analytics_result": {
    // Updated analytics using latest assumptions
  },
  "snapshot_of_assumptions": {
    // Latest assumptions from assumptions engine
  }
}
```

## Error Examples

### 9. Unauthorized Access

**Request:**
```bash
GET /api/v1/deals
# No Authorization header
```

**Response:** `403 Forbidden`
```json
{
  "detail": "Not authenticated"
}
```

### 10. Accessing Another User's Deal

**Request:**
```bash
GET /api/v1/deals/999
Authorization: Bearer <other_user_token>
```

**Response:** `403 Forbidden`
```json
{
  "detail": "Not enough permissions"
}
```

### 11. Invalid Deal Data

**Request:**
```bash
POST /api/v1/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "purchase_price": 350000,
  "down_payment": 350000  // Invalid: down_payment >= purchase_price
}
```

**Response:** `422 Unprocessable Entity`
```json
{
  "detail": [
    {
      "loc": ["body", "down_payment"],
      "msg": "Down payment must be less than purchase price.",
      "type": "value_error"
    }
  ]
}
```

## Admin Examples

### 12. List All Deals (Admin Only)

**Request:**
```bash
GET /api/v1/admin/deals?skip=0&limit=50
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "purchase_price": 350000,
    // ... deal data
  },
  {
    "id": 2,
    "user_id": 2,
    "purchase_price": 250000,
    // ... deal data
  }
]
```

## React Frontend Integration Example

### TypeScript Interface

```typescript
interface DealResponse {
  id: number;
  user_id: number;
  property_id?: number;
  purchase_price: number;
  down_payment: number;
  monthly_rent: number;
  snapshot_of_analytics_result: {
    cash_flow: {
      monthly_cash_flow: number;
      annual_cash_flow: number;
      cash_on_cash_return: number;
    };
    dscr: {
      dscr: number | null;
      interpretation: string;
    };
    deal_analysis: {
      overall_score: number;
      label: "Strong Deal" | "Neutral" | "Weak Deal";
      reasons: string[];
    };
  };
  created_at: string;
  updated_at: string;
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useDeals() {
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('/api/v1/deals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setLoading(false);
      });
  }, []);

  return { deals, loading };
}
```

