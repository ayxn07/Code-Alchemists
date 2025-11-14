# ⚠️ CRITICAL: LinkedIn Developer Console Configuration

## YOU MUST UPDATE YOUR LINKEDIN APP SETTINGS

The redirect URI error occurs because your LinkedIn Developer app settings don't match the callback URL in your code.

### Step-by-Step Fix:

1. **Go to LinkedIn Developers**: https://www.linkedin.com/developers/apps

2. **Select your app** (the one with Client ID: `77sx5brwubum12`)

3. **Click on "Auth" tab** in the left sidebar

4. **Find "Authorized redirect URLs for your app"** section

5. **Add this EXACT URL** (if not already there):

   ```
   http://localhost:3000/api/integrations/linkedin/callback
   ```

   ⚠️ **IMPORTANT**:

   - Must be EXACTLY this URL
   - Include `http://` (not `https://`)
   - Include the port `:3000`
   - Include the full path `/api/integrations/linkedin/callback`
   - No trailing slash

6. **Click "Update"** to save

7. **Verify Products**: Under "Products" tab, make sure you have:
   - ✅ "Sign In with LinkedIn using OpenID Connect" (should be approved/pending)

### What Changed in Your Code:

✅ **Created callback route**: `/api/integrations/linkedin/callback/route.ts`

- This is where LinkedIn redirects users after authorization
- Exchanges OAuth code for access token
- Fetches user profile and email
- Redirects to dashboard

✅ **Fixed environment variables**: Added `NEXT_PUBLIC_` prefixes

- Client-side code can now access LinkedIn credentials
- No more "YOUR_CLIENT_ID" fallback

✅ **Updated OAuth scopes**: Changed from deprecated to modern scopes

- Old: `r_liteprofile r_emailaddress`
- New: `openid profile email`

✅ **Added error handling**: Shows clear error messages in UI

✅ **Added authentication flow**: Login/register now works with proper API calls

### Testing After Configuration:

1. **Save your LinkedIn app settings** in the Developer Console

2. **Server is already running** at http://localhost:3000

3. **Test the flow**:
   - Open http://localhost:3000/login
   - Click "Continue with LinkedIn"
   - You should be redirected to LinkedIn
   - After authorizing, you'll be redirected back to your app
   - Should land on dashboard with success

### If You Still Get "redirect_uri does not match":

**Double-check these match EXACTLY:**

LinkedIn Developer Console:

```
http://localhost:3000/api/integrations/linkedin/callback
```

Your `.env.local`:

```
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback
```

Your code (LoginPage.tsx): ✅ Already correct

**Common mistakes:**

- ❌ `https://` instead of `http://` for localhost
- ❌ Missing `:3000` port
- ❌ Different path (e.g., `/callback` instead of `/api/integrations/linkedin/callback`)
- ❌ Trailing slash at the end
- ❌ Typo in the path

### Environment Variables (Already Set):

```env
# Server-side (for API routes)
LINKEDIN_CLIENT_ID=77sx5brwubum12
LINKEDIN_CLIENT_SECRET=WPL_AP1.wpa3wXaBKm0qxmhU.rWAydg==
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback

# Client-side (for browser)
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=77sx5brwubum12
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback
```

✅ **All set in your `.env.local` - no changes needed**

### What Happens Now:

1. User clicks "Continue with LinkedIn" on login page
2. Browser redirects to: `https://www.linkedin.com/oauth/v2/authorization?...`
3. User authorizes on LinkedIn's site
4. LinkedIn redirects to: `http://localhost:3000/api/integrations/linkedin/callback?code=...`
5. Your callback route handles the code, gets access token, fetches profile
6. User is redirected to dashboard

**The key fix**: LinkedIn needs to know that `http://localhost:3000/api/integrations/linkedin/callback` is a valid redirect URL for your app.
