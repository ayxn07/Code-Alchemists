# LinkedIn OAuth Setup Guide

## Problem Solved

Fixed the "redirect_uri does not match" error by:

1. Creating the proper callback route at `/api/integrations/linkedin/callback`
2. Ensuring environment variables match LinkedIn Developer Console settings
3. Updating OAuth scopes to use LinkedIn's current API

## LinkedIn Developer Console Setup

1. Go to https://www.linkedin.com/developers/apps
2. Select your app (or create a new one)
3. Under "Auth" tab, add these **Authorized redirect URLs**:

   ```
   http://localhost:3000/api/integrations/linkedin/callback
   ```

   For production, also add:

   ```
   https://yourdomain.com/api/integrations/linkedin/callback
   ```

4. Under "Products", request access to:

   - **Sign In with LinkedIn using OpenID Connect**
   - This gives you access to: `openid`, `profile`, `email` scopes

5. Copy your credentials:
   - **Client ID**: Found on the "Auth" tab
   - **Client Secret**: Found on the "Auth" tab (click "Show" to reveal)

## Environment Variables

Your `.env.local` should have these variables (already configured):

```env
# Server-side LinkedIn credentials
LINKEDIN_CLIENT_ID=77sx5brwubum12
LINKEDIN_CLIENT_SECRET=WPL_AP1.wpa3wXaBKm0qxmhU.rWAydg==
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback

# Client-side LinkedIn credentials (exposed to browser)
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=77sx5brwubum12
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/api/integrations/linkedin/callback
```

**Important**: The `NEXT_PUBLIC_` prefix is required for environment variables that need to be accessible in the browser.

## OAuth Flow

1. **User clicks "Connect with LinkedIn"** on the login page
2. **Redirect to LinkedIn** with authorization URL containing:

   - `client_id`: Your LinkedIn app client ID
   - `redirect_uri`: Must match exactly what's in LinkedIn Developer Console
   - `scope`: `openid profile email`
   - `state`: Random string for security

3. **User authorizes** on LinkedIn's page

4. **LinkedIn redirects back** to your callback URL with:

   - `code`: Authorization code (exchange this for access token)
   - `state`: Should match the state you sent

5. **Your callback route** (`/api/integrations/linkedin/callback/route.ts`):
   - Exchanges code for access token
   - Fetches user profile from LinkedIn API
   - Creates/logs in user
   - Redirects to dashboard

## Updated OAuth Scopes

LinkedIn deprecated older scopes. Now using:

- ~~`r_liteprofile`~~ (deprecated)
- ~~`r_emailaddress`~~ (deprecated)
- ✅ `openid` (required for Sign In with LinkedIn)
- ✅ `profile` (basic profile info)
- ✅ `email` (user's email address)

## Testing

1. **Start the dev server**:

   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/login

3. **Click** "Continue with LinkedIn" button

4. **Authorize** on LinkedIn (you'll be redirected to LinkedIn's page)

5. **Success**: You'll be redirected back to http://localhost:3000/dashboard

## Troubleshooting

### Error: "redirect_uri does not match"

- ✅ **FIXED**: Callback route created at `/api/integrations/linkedin/callback`
- Make sure the URL in LinkedIn Developer Console matches **exactly** (including http/https, port, path)
- Check that `NEXT_PUBLIC_LINKEDIN_REDIRECT_URI` in `.env.local` matches

### Error: "invalid client_id"

- ✅ **FIXED**: Added `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` to `.env.local`
- Verify the client ID is correct in LinkedIn Developer Console
- Restart dev server after changing environment variables

### Error: "insufficient scope"

- ✅ **FIXED**: Updated to use `openid profile email` scopes
- Make sure you've requested "Sign In with LinkedIn using OpenID Connect" product in Developer Console
- Wait for LinkedIn to approve the product access (usually instant for Sign In)

### Environment variables not updating

- **Restart the dev server** after any `.env.local` changes
- Next.js embeds `NEXT_PUBLIC_` variables at build time
- Clear `.next` folder if needed: `rm -rf .next` or `Remove-Item .next -Recurse -Force`

## File Changes Made

1. **Created**: `src/app/api/integrations/linkedin/callback/route.ts`

   - Handles OAuth callback from LinkedIn
   - Exchanges code for access token
   - Fetches user profile
   - Redirects to dashboard

2. **Updated**: `src/app/components/LoginPage.tsx`

   - Added proper error handling
   - Added loading states
   - Fixed OAuth URL construction
   - Added authentication API calls
   - Updated to use modern LinkedIn scopes

3. **Updated**: `.env.local`
   - Added `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
   - Added `NEXT_PUBLIC_LINKEDIN_REDIRECT_URI`

## Next Steps

After LinkedIn login works:

1. Implement user session management
2. Store LinkedIn data in MongoDB
3. Use LinkedIn profile to pre-fill user profile
4. Implement token refresh for LinkedIn API calls
5. Add LinkedIn profile import functionality
