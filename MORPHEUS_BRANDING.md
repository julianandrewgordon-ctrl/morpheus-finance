# Morpheus Branding - Landing Page

## What's Been Implemented

✅ **Landing Page** - Beautiful cover page with purple/black theme
✅ **Morpheus Branding** - App renamed to "Morpheus - Financial Planning"
✅ **Animated Entry** - Smooth fade transition to main app
✅ **Feature Highlights** - Shows key capabilities
✅ **Floating Animation** - Avatar has subtle floating effect

## To Add Your Avatar Image

### Option 1: Using the Image File

1. **Save your avatar image** to `finance-manager/public/assets/morpheus-avatar.png`

2. **Update LandingPage.jsx** - Replace the placeholder "M" with your image:

```jsx
// Find this section (around line 60):
<div style={{
  width: '250px',
  height: '250px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '80px',
  color: 'white',
  fontWeight: 'bold',
  textShadow: '0 0 20px rgba(138, 43, 226, 0.8)'
}}>
  M
</div>

// Replace with:
<img 
  src="/assets/morpheus-avatar.png" 
  alt="Morpheus Avatar"
  style={{
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    objectFit: 'cover'
  }}
/>
```

### Option 2: Using Base64 (If you want to embed the image)

1. Convert your image to base64
2. Replace the placeholder with:

```jsx
<img 
  src="data:image/png;base64,YOUR_BASE64_STRING_HERE" 
  alt="Morpheus Avatar"
  style={{
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    objectFit: 'cover'
  }}
/>
```

## Current Features

### Landing Page
- **Purple/Black Theme** - Matches the avatar's aesthetic
- **Grid Background** - Subtle tech/matrix vibe
- **Glowing Effects** - Purple glow around avatar and text
- **Floating Animation** - Avatar gently floats up and down
- **Fade Transition** - Smooth entry to main app

### Main App
- **Rebranded Title** - "🔮 Morpheus - Financial Planning"
- **All existing features** - Dashboard, Rules, Scenarios, etc.

## Customization Options

### Change Colors
Edit `LandingPage.jsx` to adjust the purple theme:
- Main purple: `#8a2be2` (blueviolet)
- Dark purple: `#4b0082` (indigo)
- Light purple: `#da70d6` (orchid)
- Background: `#1a0033` to `#2d1b4e` gradient

### Change Tagline
Line 95: "See the Future of Your Finances"
Line 105: "Scenario-based financial planning powered by AI insights"

### Add More Features
Lines 125-145: Feature grid with icons and descriptions

## To Disable Landing Page

If you want to skip straight to the app:

In `App.jsx`, change:
```jsx
const [showLanding, setShowLanding] = useState(true)
```
to:
```jsx
const [showLanding, setShowLanding] = useState(false)
```

## File Locations

- Landing Page Component: `src/components/LandingPage.jsx`
- Main App: `src/App.jsx`
- Avatar Image (to add): `public/assets/morpheus-avatar.png`

## Next Steps

1. Save your avatar image to the public/assets folder
2. Update LandingPage.jsx to use the image
3. Refresh the browser
4. Enjoy your branded Morpheus financial planner!
