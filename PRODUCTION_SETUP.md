# Production Setup Guide

This guide will help you deploy BrightSteps to a production environment.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (recommended for production)
- Reverse proxy (nginx, Caddy, etc.)
- SSL certificate

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the project root:

```bash
# Database - Use PostgreSQL in production
DATABASE_URL=postgresql://user:password@localhost:5432/brightsteps

# Security - Generate a secure key:
# python -c 'import secrets; print(secrets.token_urlsafe(32))'
SECRET_KEY=your-generated-secret-key-min-32-chars

# Application
DEBUG=False
PROJECT_NAME=BrightSteps Real Estate Platform

# CORS - Comma-separated list of allowed origins
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: OpenAI API Key (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Optional: Stripe Keys (for billing)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 2. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Migration

```bash
# Run migrations
alembic upgrade head
```

### 4. Run with Production Server

```bash
# Using Gunicorn with Uvicorn workers (recommended)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or using Uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Frontend Setup

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. Build for Production

```bash
cd frontend
npm install
npm run build
```

The production build will be in the `frontend/dist/` directory.

### 3. Serve Frontend

You can serve the frontend using:

- **Nginx** (recommended)
- **Caddy** (automatic HTTPS)
- **Node.js** static server (for testing)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    root /path/to/brightsteps/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static {
        proxy_pass http://localhost:8000;
    }
}
```

## Security Checklist

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Set `DEBUG=False` in production
- [ ] Configure `CORS_ORIGINS` with specific domains (no wildcards)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set up firewall rules
- [ ] Configure rate limiting (consider using nginx or a middleware)
- [ ] Set up monitoring and logging
- [ ] Regular database backups
- [ ] Keep dependencies updated

## Monitoring

### Health Check

The `/health` endpoint provides basic health information:

```bash
curl https://api.yourdomain.com/health
```

Response:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "database": "ok",
  "debug": false
}
```

### Logging

Configure logging in production:

```python
# Add to app/main.py or use environment variables
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

## Performance Optimization

1. **Database Connection Pooling**: Already configured in SQLAlchemy
2. **Caching**: Consider adding Redis for session storage
3. **CDN**: Use a CDN for static assets
4. **Compression**: Enable gzip compression in nginx
5. **Database Indexing**: Ensure proper indexes on frequently queried columns

## Backup Strategy

1. **Database Backups**: Set up automated PostgreSQL backups
2. **File Backups**: Backup the `static/uploads/` directory
3. **Configuration**: Keep `.env` files secure and backed up

## Deployment Options

### Traditional VPS

- DigitalOcean, Linode, AWS EC2
- Use systemd for process management
- Set up nginx as reverse proxy

### Containerized (Docker)

See `Dockerfile` and `docker-compose.yml` (if available)

### Platform as a Service

- **Heroku**: Easy deployment with PostgreSQL addon
- **Railway**: Simple deployment with automatic HTTPS
- **Fly.io**: Global edge deployment

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Verify firewall rules allow connections

### CORS Errors

- Ensure `CORS_ORIGINS` includes your frontend domain
- Check that credentials are properly configured
- Verify HTTPS is used consistently

### Static Files Not Loading

- Check nginx configuration for `/static` path
- Verify file permissions
- Ensure `static/` directory exists

## Support

For issues or questions, please refer to the main README or open an issue in the repository.

