# 🔴 URGENT: Add Redirect URI to LinkedIn Developer Console

## The Problem

LinkedIn is rejecting the redirect because **you haven't added the callback URL to your LinkedIn app settings yet**.

---

## 🎯 EXACT STEPS TO FIX (Follow Precisely):

### Step 1: Open LinkedIn Developer Console

1. Go to: **https://www.linkedin.com/developers/apps**
2. Log in with your LinkedIn account
3. Find your app with Client ID: **77sx5brwubum12**
4. Click on the app name to open it

### Step 2: Navigate to Auth Settings

1. In the left sidebar, click **"Auth"** tab
2. Scroll down to find **"OAuth 2.0 settings"** section
3. Look for **"Authorized redirect URLs for your app"**

### Step 3: Add the Redirect URL

1. In the **"Authorized redirect URLs"** field, click **"+ Add redirect URL"**
2. Type EXACTLY this (copy-paste to avoid typos):
   ```
   http://localhost:3000/api/integrations/linkedin/callback
   ```
3. Click the **checkmark** or **"Add"** button
4. Click **"Update"** button at the bottom to save

### Step 4: Verify Products

1. Click **"Products"** tab in the left sidebar
2. Make sure **"Sign In with LinkedIn using OpenID Connect"** is listed
3. If not listed, click **"Request access"** button next to it
4. It should be approved instantly (status will show "Approved")

### Step 5: Double-Check Settings

Go back to **"Auth"** tab and verify:

- ✅ Client ID: `77sx5brwubum12` (should already be there)
- ✅ Client Secret: `WPL_AP1.wpa3wXaBKm0qxmhU.rWAydg==` (should already be there)
- ✅ Authorized redirect URL: `http://localhost:3000/api/integrations/linkedin/callback` (you just added this)

---

## 🧪 Test Your Configuration

### Option 1: Visual Test

1. Visit: **http://localhost:3000/api/test-linkedin**
2. This will show you:
   - Your current configuration
   - The exact URL to add to LinkedIn
   - A test authorization URL you can click

### Option 2: Full Login Flow Test

1. Go to: **http://localhost:3000/login**
2. Click **"Continue with LinkedIn"** button
3. You'll be redirected to LinkedIn
4. Click **"Allow"** to authorize
5. You should be redirected back to your app (dashboard)

---

## ⚠️ Common Mistakes (Don't Do These!)

❌ **Wrong**: `https://localhost:3000/api/integrations/linkedin/callback` (uses https)
✅ **Correct**: `http://localhost:3000/api/integrations/linkedin/callback` (uses http)

❌ **Wrong**: `http://localhost/api/integrations/linkedin/callback` (missing port)
✅ **Correct**: `http://localhost:3000/api/integrations/linkedin/callback` (includes :3000)

❌ **Wrong**: `http://localhost:3000/api/integrations/linkedin/callback/` (trailing slash)
✅ **Correct**: `http://localhost:3000/api/integrations/linkedin/callback` (no trailing slash)

❌ **Wrong**: `http://127.0.0.1:3000/api/integrations/linkedin/callback` (IP instead of localhost)
✅ **Correct**: `http://localhost:3000/api/integrations/linkedin/callback` (use localhost)

---

## 📋 What LinkedIn Console Should Look Like

```
OAuth 2.0 settings

Application credentials
Client ID: 77sx5brwubum12
Client Secret: WPL_AP1.wpa3wXaBKm0qxmhU.rWAydg== [Show]

Authorized redirect URLs for your app
http://localhost:3000/api/integrations/linkedin/callback  [Remove]
[+ Add redirect URL]

[Update]  [Cancel]
```

---

## 🔍 Still Getting Error?

### If you're seeing "redirect_uri does not match":

1. **Double-check the URL in LinkedIn console** - Must be EXACTLY:

   ```
   http://localhost:3000/api/integrations/linkedin/callback
   ```

2. **Clear browser cache**:

   - Press `Ctrl + Shift + Delete`
   - Clear cached data
   - Close and reopen browser

3. **Verify environment variables** - Visit http://localhost:3000/api/test-linkedin

4. **Check LinkedIn console saved properly**:

   - Go back to Auth tab
   - Verify the URL is still there
   - Make sure you clicked "Update"

5. **Try incognito/private window** - Sometimes old OAuth sessions cause issues

6. **Check LinkedIn app status**:
   - App should be in "Development" mode (that's fine)
   - Products → "Sign In with LinkedIn" should be approved

---

## 📱 For Production (Later)

When you deploy to production, you'll also need to add:

```
https://yourdomain.com/api/integrations/linkedin/callback
```

But for now, just add the localhost URL.

---

## 🆘 Need More Help?

**Screenshot what you're seeing:**

1. Take screenshot of LinkedIn "Auth" tab showing your redirect URLs
2. Take screenshot of the error message
3. Share them so I can help identify the exact issue

**Or check:**

- Visit http://localhost:3000/api/test-linkedin to see configuration
- Check browser console (F12) for any error details
- Check terminal where `npm run dev` is running for server errors

---

## ✅ Success Looks Like This:

1. Click "Continue with LinkedIn" on login page
2. LinkedIn asks "Allow [Your App] to access your profile?"
3. Click "Allow"
4. Redirected back to http://localhost:3000/dashboard
5. See success message or your dashboard loads

**That's it!** Once you add the redirect URL to LinkedIn console, it will work immediately.
