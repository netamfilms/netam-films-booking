# NETAM FILMS — booking website

A responsive Next.js booking website with a live estimate, WhatsApp handoff, Supabase-backed booking records, admin login/dashboard, editable service prices, and Razorpay order/signature verification.

## Important implementation notes

- Customer submissions create **pending review** requests, not confirmed reservations.
- The WhatsApp step opens a pre-filled message to the studio. The customer must tap **Send** in WhatsApp; websites cannot silently send WhatsApp messages.
- UPI checkout uses Razorpay Checkout. A payment is marked paid only after server-side signature verification or a verified Razorpay `payment.captured` webhook. Test in Razorpay Test Mode first.
- Cash-at-studio requests remain `advance_pending` until an admin confirms the cash advance.
- Date/resource collision prevention is intentionally **admin-reviewed**, not automatic: this first release does not assume equipment/team capacity. Before automatic date locking, configure staff/equipment capacity and a transactional availability check. Never promise availability based on the submitted date alone.
- The site currently uses a typographic “N” placeholder. Replace it with the exact business logo asset supplied by the owner.

## Requirements

- Node.js 20+
- Supabase project
- Razorpay account (optional until online payments are enabled)
- Vercel or another Node.js hosting provider

## 1. Install

```bash
npm install
cp .env.example .env.local
```

Fill in Supabase URL, anon key, service-role key, and `ADMIN_EMAIL`. Keep `.env.local` private and never commit it.

## 2. Database

In Supabase SQL Editor, run `supabase/migrations/001_initial.sql`.

Create an admin user in Supabase Dashboard → Authentication → Users → Add user. Use the same email as `ADMIN_EMAIL`. Set a strong password and enable MFA in Supabase for better protection.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin/login.

## 4. Configure online payments

1. Create/verify your Razorpay account and activate the UPI payment methods available to your account.
2. Start with Razorpay **Test Mode** keys in `.env.local`.
3. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
4. In Razorpay Dashboard, create a webhook pointing to `https://YOUR_DOMAIN/api/payments/webhook`, subscribe to `payment.captured`, and set `RAZORPAY_WEBHOOK_SECRET`.
5. Set `NEXT_PUBLIC_SITE_URL` to the exact deployed origin.
6. Test successful, failed, abandoned and duplicate payment cases before switching to Live Mode.
7. Only then replace test keys with Live Mode credentials. Never ask customers to send a UPI screenshot as proof of automated payment verification.

## 5. Deploy

1. Push this project to a private Git repository.
2. Import it into Vercel.
3. Add every variable from `.env.example` in Vercel Project Settings → Environment Variables.
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
5. Deploy, then test customer booking, admin login, CSV export, cash pending state and Razorpay test payment.
6. Add your own domain and configure HTTPS.

## 6. Business identity and logo

The website uses a premium white/black/gold design and a temporary “N” monogram. Add the original logo file as `public/netam-logo.png`, then replace the monogram in `app/page.tsx` and admin header with an image. Use the original high-resolution/transparent logo so the emblem is not redrawn or distorted.

## 7. Admin workflow

- Open `/admin/login`.
- Sign in with the Supabase Auth user whose email matches `ADMIN_EMAIL`.
- Review pending requests and contact the customer if required.
- Check availability of your people and equipment manually.
- Change booking status to `confirmed` only after you approve the date and requirements.
- For cash advances, set payment status to `paid` only after receiving the money at the studio.
- Update service prices in the dashboard. Prices are used for new estimates; already-created booking estimates remain historical snapshots.

## Security and production checklist

- Use a unique strong admin password and MFA.
- Keep Supabase service-role and Razorpay secret keys server-side only.
- Configure Supabase backups and monitoring.
- Add rate limiting / CAPTCHA to public booking submission before advertising the site widely.
- Add a privacy policy and customer data retention policy before launch.
- Set up transactional email/SMS notifications if desired; WhatsApp click-to-chat requires the customer to send the prepared message.
- Add an audited, capacity-aware availability transaction before automatic date/resource blocking.
