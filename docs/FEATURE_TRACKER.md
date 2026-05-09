# Platform Feature Tracker

This document tracks the status of requested features, missing items, and next steps for the Rbabikerentals platform.

## P0: Launch-Critical Features

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Policy Transparency Module | ✅ Done | Karteek / AI | UI implemented on Checkout Page |
| Doorstep Delivery Toggle | ✅ Done | Karteek / AI | UI implemented on Checkout Page (Needs API logic) |
| Razorpay Test Flow | ⏳ Pending | Jagadeep / Karteek | Need to add test keys to `.env.local` and verify |
| Setu DigiLocker Test Flow | ⏳ Pending | Jagadeep / Karteek | Waiting on Setu Sandbox keys |
| Google Sign-In | ⏳ Pending | Karteek / AI | Code added; waiting on Google Client ID/Secret |
| Real Offers / Promo Engine | 📋 Backlog | TBD | Requires Admin UI to create coupons and API validation |
| Subscription Productization | 📋 Backlog | TBD | True subscription entity with autopay mandates |

## P1: High-Impact (Next up)

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Referral and Wallet loops | 📋 Backlog | TBD | Issuance, reward ledger, expiry |
| Partner Supply Onboarding | 📋 Backlog | TBD | Admin flow to invite/onboard partners |
| Hub/coverage intelligence | 📋 Backlog | TBD | "Nearest pickup hub" view with live stock |

## Data & ML (Future Scope)

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Dynamic Pricing Engine | 📋 Backlog | Karteek | Python FastAPI service for demand-aware pricing |
| Analytics ETL Pipeline | 📋 Backlog | Karteek | Partner payouts and utilization metrics |
| Predictive Maintenance | 📋 Backlog | Karteek | ML model using live tracking telemetry |
