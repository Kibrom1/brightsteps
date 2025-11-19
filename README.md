You are helping me build **Phase 1 – Analytics Engine Core** for a real estate investment platform.

## Tech Stack (Important)

- **Backend:** Python, FastAPI, Pydantic, pytest
- **Frontend:** React (not implemented in this phase, but shape responses so React can consume them later)
- **API style:** REST + JSON
- **Goal of this phase:** Build ONLY the backend **Analytics Engine** (“the brain”) as a standalone FastAPI service. No frontend/UI code yet.

---

## 1. Scope of Phase 1 (Analytics Engine Only)

Build a Python/FastAPI service that exposes APIs to calculate:

1. **Cap Rate**
   - Inputs:
     - purchase_price
     - annual_rent
     - annual_expenses
   - Outputs:
     - cap_rate (percent as float)
     - derived fields (NOI, etc.)

2. **Cash Flow Engine**
   - Inputs:
     - purchase_price
     - down_payment
     - interest_rate
     - loan_term_years
     - monthly_rent
     - property_tax_annual
     - insurance_annual
     - hoa_monthly (optional)
     - maintenance_percent
     - vacancy_percent
     - management_percent
   - Outputs:
     - monthly_cash_flow
     - annual_cash_flow
     - NOI
     - monthly_debt_service
     - cash_on_cash_return
     - summary string

3. **DSCR Calculator**
   - Inputs:
     - noi_annual
     - annual_debt_service
   - Outputs:
     - dscr
     - interpretation:
       - dscr < 1.0 -> "Negative cash flow / risk"
       - 1.0–1.2 -> "Borderline"
       - > 1.2 -> "Healthy coverage"

4. **Rent Estimator (Basic Rule-Based Model)**
   - Inputs:
     - bedrooms
     - bathrooms
     - square_feet
     - zip_code
     - property_type (single_family, multi_family, condo, townhouse)
   - Outputs:
     - estimated_rent
     - assumptions used (so UI can display them)
   - Logic:
     - Use a simple base rent per sqft + multipliers per bedroom/bathroom/property type.
     - Make coefficients configurable in one place so they can be tuned later.

5. **Assumptions Engine**
   - Centralize all configurable assumptions in one Pydantic model:
     - vacancy_percent
     - maintenance_percent
     - management_percent
     - property_tax_percent (of property value)
     - insurance_percent (of property value)
     - appreciation_percent_annual
     - rent_growth_percent_annual
   - Provide:
     - A GET endpoint to fetch current defaults
     - A POST/PUT endpoint to override defaults in memory for now (no DB in Phase 1, just keep it simple with in-memory storage or a config module)

6. **Deal Analyzer AI Helper (Early Version, Rule-Based)**
   - Input: JSON representing a deal:
     - purchase_price
     - down_payment
     - monthly_rent
     - expenses or assumptions
   - Internally call the cash flow + DSCR calculators.
   - Output:
     - overall_score (e.g., 0–100)
     - label: "Strong Deal" | "Neutral" | "Weak Deal"
     - reasons: list of bullet strings (e.g., "Cash flow > $300", "DSCR below 1.1", etc.)
   - This is NOT an LLM call yet — just rule-based logic in this phase.

---

## 2. API Design Requirements (FastAPI)

Create a FastAPI app with the following endpoints:

- `POST /api/v1/calculate/cap-rate`
- `POST /api/v1/calculate/cash-flow`
- `POST /api/v1/calculate/dscr`
- `POST /api/v1/estimate/rent`
- `GET  /api/v1/assumptions`
- `PUT  /api/v1/assumptions`
- `POST /api/v1/analyze/deal`

Requirements:

- Use **Pydantic models** for request and response bodies.
- Use clear, React-friendly JSON response shapes:
  - `data` object
  - optional `warnings` list
  - optional `errors` list
- Add descriptive docstrings to each endpoint so the generated OpenAPI/Swagger is clear.
- Include basic validation and helpful error messages.

---

## 3. Data Models (Pydantic)

Define Pydantic models for:

- `CapRateRequest`, `CapRateResponse`
- `CashFlowRequest`, `CashFlowResponse`
- `DSCRRequest`, `DSCRResponse`
- `RentEstimateRequest`, `RentEstimateResponse`
- `Assumptions` (with sensible default values)
- `DealAnalysisRequest`, `DealAnalysisResponse`

Also provide **TypeScript interfaces** that match these models so a React frontend can easily type the responses later.

---

## 4. Code Structure

Propose and implement a clean folder structure, for example:

- `app/main.py` – FastAPI app
- `app/api/routes_analytics.py` – endpoints
- `app/core/analytics.py` – pure calculation functions
- `app/core/assumptions.py` – assumptions model + default values
- `app/models/schemas.py` – Pydantic models
- `tests/test_analytics.py` – pytest unit tests for formulas
- `tests/test_api.py` – pytest tests for endpoints (using TestClient)

Make the **calculation functions pure** and separate from the FastAPI routes so they can be unit tested independently.

---

## 5. Testing Requirements (pytest)

Write **pytest** tests for:

- Each individual formula:
  - Cap rate
  - NOI
  - Cash flow
  - DSCR
  - Rent estimate
- Edge cases:
  - Zero or very low rent
  - Very high expenses
  - DSCR with zero debt service (avoid division by zero)
- A few endpoint tests using `fastapi.testclient.TestClient`:
  - Happy-path calls
  - Missing or invalid fields
  - Verify response structure is stable for use in React

---

## 6. Output Format (What I want from you)

Please output your work in this order:

1. **High-level architecture explanation**
2. **Directory structure**
3. **Pydantic models (Python)**
4. **Analytics functions implementation (Python)**
5. **FastAPI router and main app code**
6. **pytest unit tests for core analytics**
7. **pytest tests for API endpoints**
8. **TypeScript interfaces that match the responses (for future React work)**
9. **Example JSON requests & responses for each endpoint**
10. **Notes on how Phase 2 (backend integration + persistence) should plug into this**

Focus on correctness, clarity, and clean code — this will be the foundation used by both the React frontend and future mobile clients.