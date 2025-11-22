#!/bin/bash
# Test login endpoint

echo "Testing login endpoint..."
echo ""

# Test admin login
echo "1. Testing admin login:"
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@brightsteps.com","password":"admin123"}' | python3 -m json.tool

echo ""
echo "2. Testing with invalid credentials:"
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brightsteps.com","password":"wrong"}' | python3 -m json.tool

