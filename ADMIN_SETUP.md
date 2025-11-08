# Environment Variables Setup for LydsArt Admin System

## Local Development (.env files)

### Client (.env)
```bash
REACT_APP_ADMIN_EMAIL=lydiapatersonart@gmail.com
```

### Server (No .env needed - uses Firebase secrets)

## Production (Firebase Secrets)

The admin email is stored as a Firebase secret for security in production.

### Setting up Firebase Secrets:

1. **Set the admin email secret:**
   ```bash
   firebase functions:secrets:set ADMIN_EMAIL
   # Enter: lydiapatersonart@gmail.com when prompted
   ```

2. **View existing secrets:**
   ```bash
   firebase functions:secrets:access ADMIN_EMAIL
   ```

3. **Update a secret:**
   ```bash
   firebase functions:secrets:set ADMIN_EMAIL --force
   ```

4. **Deploy functions with secrets:**
   ```bash
   firebase deploy --only functions
   ```

### Security Benefits:

- ✅ Admin email is NOT visible in source code
- ✅ Local .env files are gitignored (not committed)
- ✅ Production uses Firebase Secret Manager (encrypted)
- ✅ Only authorized Firebase project members can access secrets
- ✅ Secrets are automatically injected into functions at runtime

### Changing Admin Email:

1. **Update local .env:**
   - Edit `client/.env`
   - Change `REACT_APP_ADMIN_EMAIL=new-admin@email.com`

2. **Update Firebase secret:**
   ```bash
   firebase functions:secrets:set ADMIN_EMAIL --force
   # Enter the new email when prompted
   ```

3. **Deploy updates:**
   ```bash
   firebase deploy --only functions
   ```

### Troubleshooting:

- If admin login fails, verify the email matches in both places
- Restart local dev server after changing .env files
- Check Firebase console for function logs if secrets aren't working
