# Google Maps API Setup

To enable address autocomplete and geocoding features in GroomRoute, you need to set up a Google Maps API key.

## Steps to Get Your API Key

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "GroomRoute" (or any name)
4. Click "Create"

### 2. Enable Required APIs

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for converting addresses to coordinates)
   - **Maps JavaScript API** (for map display - optional for now)

### 3. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key that appears

### 4. (Recommended) Restrict API Key

For security, restrict the API key:

1. Click on the API key you just created
2. Under **Application restrictions**:
   - For development: Choose "HTTP referrers (web sites)"
   - Add: `http://localhost:3000/*`
   - For production later, add your domain: `https://yourdomain.com/*`

3. Under **API restrictions**:
   - Choose "Restrict key"
   - Select:
     - Places API
     - Geocoding API
     - Maps JavaScript API

4. Click **Save**

### 5. Add to Your Project

1. Open your `.env` file
2. Add your API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key-here"
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## Testing

1. Go to the onboarding flow: http://localhost:3000/onboarding
2. On the "Base Address" step, start typing an address
3. You should see Google Places autocomplete suggestions

## Pricing

Google Maps has a generous free tier:
- **$200 free credit per month**
- Places Autocomplete: $2.83-$17 per 1,000 requests (depending on fields used)
- Geocoding: $5 per 1,000 requests

For a small grooming business:
- ~100 address lookups/month = ~$0.50
- Well within the free tier!

## Troubleshooting

### "This API project is not authorized to use this API"
- Make sure you've enabled the required APIs (step 2)

### Autocomplete not showing
- Check browser console for errors
- Verify API key is in `.env` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Make sure you restarted the dev server after adding the key

### "referer not allowed"
- Add `http://localhost:3000/*` to HTTP referrers in API restrictions
