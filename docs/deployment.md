# Deployment

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure MongoDB Atlas or production MongoDB instance
- [ ] Set `STOREFRONT_URL` and `ADMIN_URL` to production domains
- [ ] Configure SMTP for email notifications
- [ ] Set Stripe keys when payment is enabled
- [ ] Configure design provider license key
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set up reverse proxy (nginx/Caddy) for all three apps
- [ ] Configure MongoDB backups
- [ ] Set up monitoring and logging

## Build for Production

```bash
npm run build
```

## Start API

```bash
cd apps/api
NODE_ENV=production node dist/server.js
```

## Serve Frontends

Build outputs are in `apps/storefront/dist` and `apps/admin/dist`. Serve via nginx, Vercel, Netlify, or any static host.

## Environment Variables

Never commit `.env` files. Use your hosting platform's secret management for:
- `MONGODB_URI`
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `SMTP_*` credentials
- `STRIPE_SECRET_KEY`
- `DESIGN_PROVIDER_LICENSE_KEY`

Frontend apps only need `VITE_API_URL` pointing to the production API.

## Recommended Infrastructure

- **API**: Railway, Render, AWS ECS, or DigitalOcean App Platform
- **MongoDB**: MongoDB Atlas
- **Storefront/Admin**: Vercel, Netlify, or CloudFront + S3
- **File uploads**: S3 or compatible object storage (future)

## Docker (Future)

Docker configuration can be added for containerized deployment. The monorepo structure supports separate Dockerfiles per app.
