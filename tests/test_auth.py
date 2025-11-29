"""Tests for authentication."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_user_success(client):
    """Test successful user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
            "role": "investor",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "password" not in data


def test_register_duplicate_email(client):
    """Test registration with duplicate email."""
    # Register first user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "full_name": "First User",
        },
    )

    # Try to register again with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "password123",
            "full_name": "Second User",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client):
    """Test successful login."""
    # Register user first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "loginpassword123",
            "full_name": "Login User",
        },
    )

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "loginpassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_incorrect_password(client):
    """Test login with incorrect password."""
    # Register user first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "correctpassword123",
            "full_name": "Wrong Pass User",
        },
    )

    # Try to login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401


def test_get_current_user_with_token(client):
    """Test getting current user profile with valid token."""
    # Register and login
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile@example.com",
            "password": "profilepass123",
            "full_name": "Profile User",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "profile@example.com",
            "password": "profilepass123",
        },
    )
    token = login_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@example.com"


def test_get_current_user_without_token(client):
    """Test getting current user without token."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401  # Unauthorized - no token

