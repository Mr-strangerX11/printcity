# PrintCity — Disaster Recovery Runbook

**Last updated:** 2026-05-29  
**Owner:** Engineering Team  
**Review cadence:** Quarterly or after any significant incident

---

## 1. Incident Classification

| Severity | Definition | Target RTO | Target RPO |
|---|---|---|---|
| P1 — Critical | Service fully unavailable, payment processing down, data loss | 1 hour | 15 min |
| P2 — High | Core feature broken (checkout/orders failing), data exposure | 4 hours | 1 hour |
| P3 — Medium | Non-critical feature degraded | 24 hours | 4 hours |
| P4 — Low | UI glitch, cosmetic issue | 72 hours | N/A |

---

## 2. Key Contacts & Access

| Resource | Location |
|---|---|
| MongoDB Atlas | atlas.mongodb.com — project PrintCity |
| Vercel dashboard | vercel.com/team/printcity |
| Sentry | sentry.io/printcity |
| AWS S3 backups | s3://printcity-backups/printcity/backups/ |
| Cloudinary media | cloudinary.com — PrintCity account |
| Domain registrar | (update with actual registrar) |

---

## 3. Scenario Runbooks

### 3.1 Complete Database Loss

**Symptoms:** All API requests return 500, MongoDB connection errors in Sentry

**Steps:**
1. Confirm the issue: `curl https://api.printcity.com/health` returns non-200
2. Check MongoDB Atlas status page and cluster health dashboard
3. If Atlas cluster is gone, restore from latest backup:
   ```bash
   # Find latest backup
   aws s3 ls s3://printcity-backups/printcity/backups/ --recursive | sort | tail -5

   # Download
   aws s3 cp s3://printcity-backups/printcity/backups/YYYY/MM/DD/backup_TIMESTAMP.tar.gz /tmp/

   # Extract
   tar -xzf /tmp/backup_TIMESTAMP.tar.gz -C /tmp/

   # Restore to new Atlas cluster
   mongorestore --uri="$NEW_DATABASE_URL" --gzip /tmp/printcity_backup_TIMESTAMP/
   ```
4. Update `DATABASE_URL` in Vercel env vars
5. Redeploy: `vercel --prod`
6. Verify health endpoint returns 200
7. Test a login + order lookup

**Expected recovery time:** 30–60 minutes

---

### 3.2 Vercel Deployment Failure

**Symptoms:** Frontend/API returning 502, Vercel build failed

**Steps:**
1. Check Vercel deployment logs: `vercel logs --prod`
2. Roll back to last good deployment:
   ```bash
   vercel rollback [deployment-url]
   ```
3. If rollback isn't available, redeploy from last known-good git commit:
   ```bash
   git checkout <last-good-sha>
   vercel --prod
   ```
4. Investigate root cause before next deploy

---

### 3.3 Credentials Compromised (MongoDB / JWT / SMTP)

**Symptoms:** Suspicious activity in logs, Sentry alerts, reports of unauthorized access

**Immediate actions (within 15 minutes):**
1. **Rotate MongoDB password** in Atlas → update `DATABASE_URL` in Vercel env
2. **Rotate JWT secrets**: generate new values → update `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
3. **Rotate SMTP password**: revoke app password in Gmail/provider → update `SMTP_PASS`
4. **Rotate Cloudinary key**: regenerate in Cloudinary console → update `CLOUDINARY_API_SECRET`
5. Redeploy immediately after all secrets are rotated
6. Force-invalidate all active sessions: update `JWT_ROTATION_VERSION` env var (if implemented)
7. Notify affected users if data was accessed

**Commands:**
```bash
# Update Vercel env vars
vercel env add DATABASE_URL production
vercel env add JWT_ACCESS_SECRET production
vercel env add JWT_REFRESH_SECRET production

# Redeploy
vercel --prod
```

---

### 3.4 eSewa / Khalti Payment Stuck (Orders Stuck in PENDING)

**Symptoms:** Orders created, payments made but status not updating, customers complaining

**Investigation:**
1. Check Sentry for webhook processing errors
2. Manually verify payment on eSewa/Khalti dashboard
3. If payment confirmed externally but order still PENDING:
   ```bash
   # Manual confirmation via admin API
   curl -X POST https://api.printcity.com/api/orders/{orderId}/confirm-payment \
     -H "Cookie: accessToken=<admin-token>" \
     -H "X-CSRF-Token: <csrf-token>"
   ```
4. Check MongoDB for duplicate confirmations (idempotency guard should prevent)

---

### 3.5 Inventory Corruption (Negative Stock)

**Symptoms:** Stock counts showing negative values, fulfilled orders with unavailable items

**Investigation:**
```bash
# Find products with negative stock (run in MongoDB Atlas shell)
db.productvariants.find({ stock: { $lt: 0 } })
```

**Remediation:**
1. Identify affected variants
2. Cross-reference with recent orders to determine correct stock
3. Manually correct stock via admin API or Atlas shell:
   ```javascript
   db.productvariants.updateOne(
     { _id: ObjectId("...") },
     { $set: { stock: CORRECT_VALUE } }
   )
   ```
4. Alert vendor about discrepancy
5. Investigate if the transaction lock failed (check Sentry for `STOCK_SHORTAGE` log entries)

---

### 3.6 CSRF / Security Attack

**Symptoms:** Unusual POST requests from unknown origins, account takeover reports

**Immediate actions:**
1. Check Sentry for `ForbiddenException: Invalid or missing CSRF token` spikes
2. Review access logs for suspicious patterns
3. If active attack: temporarily enable stricter rate limiting by updating ThrottlerModule config
4. Force-rotate all JWT secrets (see 3.3)
5. If XSS confirmed: audit product descriptions for malicious content:
   ```javascript
   db.products.find({ description: /<script>/i })
   ```
6. Report to hosting provider if DDoS suspected

---

## 4. Backup Verification (Monthly)

Run monthly to verify backups are restorable:

```bash
# 1. Download latest backup
aws s3 cp $(aws s3 ls s3://printcity-backups/printcity/backups/ --recursive | sort | tail -1 | awk '{print "s3://printcity-backups/" $4}') /tmp/latest-backup.tar.gz

# 2. Restore to a local test MongoDB
tar -xzf /tmp/latest-backup.tar.gz -C /tmp/
mongorestore --uri="mongodb://localhost:27017/printcity_verify" --gzip /tmp/printcity_backup_*/

# 3. Spot check
mongosh mongodb://localhost:27017/printcity_verify --eval "db.orders.countDocuments()"
mongosh mongodb://localhost:27017/printcity_verify --eval "db.products.countDocuments()"

# 4. Clean up
mongosh mongodb://localhost:27017/printcity_verify --eval "db.dropDatabase()"
```

---

## 5. Post-Incident Protocol

After every P1/P2 incident:

1. **Timeline:** Document exact sequence of events with timestamps
2. **Root cause:** Identify what broke and why
3. **Impact:** How many users affected, revenue lost
4. **Remediation:** What was done to fix it
5. **Prevention:** What system/process change prevents recurrence
6. **Action items:** Assign owners + deadlines
7. **Communication:** Draft customer-facing status update if needed

Template: [docs/incident-template.md](./incident-template.md)

---

## 6. Health Check URLs

| Endpoint | Expected | What it checks |
|---|---|---|
| `GET /api/health/status` | 200 `{ status: "ok" }` | API alive, mail service |
| `GET /api/auth/csrf-token` | 200 `{ csrfToken: "..." }` | Auth + cookie pipeline |
| `GET /api/categories` | 200, array | DB connection |
