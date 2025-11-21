#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api/v1"

echo "Testing Analytics Engine API at $BASE_URL"
echo "----------------------------------------"

echo "1. Health Check..."
curl -s "http://127.0.0.1:8000/health" | python3 -m json.tool
echo ""

echo "2. Calculate Cap Rate..."
curl -s -X POST "$BASE_URL/calculate/cap-rate" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_price": 500000,
    "annual_rent": 60000,
    "annual_expenses": 20000
  }' | python3 -m json.tool
echo ""

echo "3. Calculate Cash Flow..."
curl -s -X POST "$BASE_URL/calculate/cash-flow" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_price": 500000,
    "down_payment": 100000,
    "interest_rate": 6.5,
    "loan_term_years": 30,
    "monthly_rent": 4500,
    "property_tax_annual": 6000,
    "insurance_annual": 1200,
    "maintenance_percent": 5,
    "vacancy_percent": 5,
    "management_percent": 8
  }' | python3 -m json.tool
echo ""

echo "4. Calculate DSCR..."
curl -s -X POST "$BASE_URL/calculate/dscr" \
  -H "Content-Type: application/json" \
  -d '{
    "noi_annual": 30000,
    "annual_debt_service": 25000
  }' | python3 -m json.tool
echo ""

echo "5. Estimate Rent..."
curl -s -X POST "$BASE_URL/estimate/rent" \
  -H "Content-Type: application/json" \
  -d '{
    "bedrooms": 3,
    "bathrooms": 2,
    "square_feet": 1500,
    "zip_code": "90210",
    "property_type": "single_family"
  }' | python3 -m json.tool
echo ""

echo "6. Analyze Deal..."
curl -s -X POST "$BASE_URL/analyze/deal" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_price": 400000,
    "down_payment": 80000,
    "monthly_rent": 3500,
    "interest_rate": 7.0,
    "loan_term_years": 30,
    "hoa_monthly": 50
  }' | python3 -m json.tool
echo ""

echo "Done."
