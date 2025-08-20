# PitchDeckGPT Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Generation Problems](#generation-problems)
3. [Image Issues](#image-issues)
4. [Navigation Problems](#navigation-problems)
5. [Performance Issues](#performance-issues)
6. [Data and Storage](#data-and-storage)
7. [Browser Compatibility](#browser-compatibility)
8. [API and Network Issues](#api-and-network-issues)
9. [Development Issues](#development-issues)
10. [Error Reference](#error-reference)

## Common Issues

### App Won't Load / Blank Screen

**Symptoms:**
- White/blank screen when accessing the application
- Loading spinner that never completes
- JavaScript console errors

**Possible Causes:**
- Missing or invalid environment variables
- Browser compatibility issues
- JavaScript disabled
- Network connectivity problems

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify .env.local exists and contains:
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key-here
   ```

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Common errors and solutions below

3. **Clear Browser Data**
   ```bash
   # Clear browser cache and data
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
   - Safari: Develop > Empty Caches
   ```

4. **Try Different Browser**
   - Test in Chrome, Firefox, Safari, or Edge
   - Ensure JavaScript is enabled

### Stuck on Creator Form

**Symptoms:**
- Shows "Create your first pitch deck" but you have existing decks
- Cannot navigate to deck list
- Back button doesn't work

**Solutions:**

1. **Clear Local Storage**
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   location.reload();
   ```

2. **Check Data Integrity**
   ```javascript
   // Check stored data:
   console.log(localStorage.getItem('pitchdecks'));
   console.log(localStorage.getItem('businessplans'));
   ```

3. **Reset Application State**
   - Refresh the page (Ctrl+R / Cmd+R)
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Generation Problems

### Pitch Deck Generation Fails

**Symptoms:**
- "Generation Failed" error message
- Progress stops mid-generation
- Individual slides fail to generate

**Possible Causes:**
- Invalid or expired OpenAI API key
- Network connectivity issues
- Rate limiting
- Invalid input data

**Solutions:**

1. **Verify API Key**
   ```bash
   # Check .env.local file
   NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-... # Should start with sk-
   
   # Test API key validity
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.openai.com/v1/models
   ```

2. **Check Network Connection**
   - Ensure stable internet connection
   - Try different network if possible
   - Check for firewall/proxy blocking

3. **Retry Generation**
   - Wait a few minutes for rate limits to reset
   - Try generating with different company information
   - Generate slides individually if full generation fails

4. **Validate Input Data**
   ```typescript
   // Ensure all required fields are filled:
   - Company Name: Not empty
   - Description: At least 10 characters
   - Industry: Valid selection
   - Funding Stage: Valid selection
   ```

### Business Plan Generation Issues

**Symptoms:**
- Business plan sections generate but are incomplete
- Generation hangs on specific sections
- Inconsistent content quality

**Solutions:**

1. **Provide Detailed Information**
   - Use comprehensive business descriptions (100+ words)
   - Include specific industry details
   - Mention target customers and market

2. **Check Section-by-Section**
   - If generation fails, note which section
   - Try regenerating from that point
   - Report consistent failures

3. **Industry-Specific Issues**
   - Some industries may have better AI training data
   - Try broader industry categories if specific ones fail

## Image Issues

### Images Won't Generate

**Symptoms:**
- "Generate Image" button doesn't work
- DALL-E errors in console
- Image generation hangs

**Solutions:**

1. **Check DALL-E API Access**
   ```bash
   # Verify your OpenAI account has DALL-E access
   # Check OpenAI dashboard for API usage and limits
   ```

2. **Try Different Slide Content**
   - Some content may be flagged by safety filters
   - Simplify slide titles and content
   - Avoid potentially sensitive topics

3. **Rate Limit Management**
   - DALL-E has stricter rate limits than GPT
   - Wait 1-2 minutes between image generation requests
   - Generate images for key slides only

### Images Don't Load / Show Error

**Symptoms:**
- Image placeholder with error icon
- "Image failed to load" message
- Previous images stop working

**Root Cause:**
DALL-E URLs expire after 2 hours for security reasons.

**Solutions:**

1. **Regenerate Expired Images**
   - Click "Regenerate Image" button
   - Images will be recreated with new URLs

2. **Upload Custom Images**
   - Click "Upload Image" to use your own visuals
   - Uploaded images don't expire
   - Supports JPG, PNG, GIF formats (max 5MB)

3. **Export PDFs for Permanent Storage**
   - PDF exports capture images permanently
   - Export immediately after generation
   - Use PDF versions for presentations

### Image Quality Issues

**Symptoms:**
- Low resolution images
- Images don't match slide content
- Inappropriate or irrelevant visuals

**Solutions:**

1. **Improve Slide Content**
   - Use more descriptive slide titles
   - Include specific visual keywords
   - Mention desired image style in content

2. **Regenerate Multiple Times**
   - DALL-E produces different results each time
   - Try 2-3 generations to find best image
   - AI-generated images vary in quality

3. **Use Custom Images**
   - Upload professional stock photos
   - Use company logos and branding
   - Create charts/graphs in other tools and upload

## Navigation Problems

### Back Button Not Working

**Symptoms:**
- Clicking "Back" button does nothing
- Cannot return to pitch deck list
- Stuck in viewer mode

**Solutions:**

1. **Hard Refresh**
   ```bash
   # Force page reload
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

2. **Check Browser Console**
   - Look for JavaScript errors
   - Refresh if errors are present

3. **Use Tab Navigation**
   - Click on "Pitch Decks" tab
   - This should reset navigation state

4. **Clear Component State**
   ```javascript
   // In console, clear React state:
   localStorage.removeItem('pitchdecks');
   location.reload();
   ```

### Slide Navigation Issues

**Symptoms:**
- Cannot move between slides
- Slide numbers incorrect
- Missing slides in navigation

**Solutions:**

1. **Check Slide Data Integrity**
   ```javascript
   // In console, inspect slide data:
   const data = JSON.parse(localStorage.getItem('pitchdecks'));
   console.log(data[0].slides); // Check slide array
   ```

2. **Regenerate Problematic Deck**
   - Delete corrupted pitch deck
   - Create new one with same information
   - Export working decks as backup

3. **Use Direct Slide Links**
   - Click specific slides in sidebar navigation
   - Avoid using next/previous if they're broken

## Performance Issues

### Slow Loading / Generation

**Symptoms:**
- Long wait times for generation
- UI becomes unresponsive
- Browser tab freezes

**Causes:**
- Large amounts of stored data
- Memory leaks
- Network latency
- Overloaded OpenAI API

**Solutions:**

1. **Clean Up Storage**
   ```javascript
   // Check storage usage
   console.log('Storage used:', JSON.stringify(localStorage).length);
   
   // Remove old pitch decks
   const data = JSON.parse(localStorage.getItem('pitchdecks') || '[]');
   const recent = data.slice(0, 5); // Keep only 5 most recent
   localStorage.setItem('pitchdecks', JSON.stringify(recent));
   ```

2. **Optimize Browser**
   - Close other tabs
   - Restart browser
   - Clear cache and cookies

3. **Check System Resources**
   - Monitor CPU and memory usage
   - Close unnecessary applications
   - Use desktop instead of mobile for large operations

### Memory Issues

**Symptoms:**
- "Out of memory" errors
- Browser crashes
- Very slow response times

**Solutions:**

1. **Reduce Data Load**
   - Export old pitch decks as PDFs
   - Delete unused business plans
   - Clear investor database if not needed

2. **Browser Settings**
   - Increase memory allocation if possible
   - Use 64-bit browser version
   - Try different browser

3. **System Optimization**
   - Restart computer
   - Free up disk space
   - Update browser to latest version

## Data and Storage

### Data Loss / Missing Content

**Symptoms:**
- Pitch decks disappeared
- Investor data missing
- Previously generated content gone

**Prevention:**
- Regular PDF exports
- Browser data backup
- Document important information externally

**Recovery:**

1. **Check Browser History**
   - Browser may have cached data
   - Try accessing from browser history

2. **Check Other Devices**
   - Data is device-specific
   - Check if you used other computers/browsers

3. **Recreate from PDFs**
   - Use exported PDFs as reference
   - Regenerate critical content
   - Import investor data manually

### Storage Quota Exceeded

**Symptoms:**
- "Storage quota exceeded" error
- Cannot save new content
- App becomes read-only

**Solutions:**

1. **Clear Old Data**
   ```javascript
   // Check what's using space
   for (let key in localStorage) {
     console.log(key, localStorage[key].length);
   }
   
   // Remove specific items
   localStorage.removeItem('old-key-name');
   ```

2. **Export and Delete**
   - Export all important content as PDFs
   - Delete original data from browser
   - Recreate only essential items

3. **Browser Settings**
   - Increase storage quota if possible
   - Clear data from other websites
   - Use private/incognito mode for testing

## Browser Compatibility

### Unsupported Browser Features

**Symptoms:**
- Missing buttons or UI elements
- Layout appears broken
- Features don't work as expected

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Solutions:**

1. **Update Browser**
   - Use latest stable version
   - Enable automatic updates
   - Clear cache after updating

2. **Enable Required Features**
   ```bash
   # Required browser features:
   - JavaScript (enabled)
   - Local Storage (enabled)
   - Cookies (enabled)
   - Modern ES6+ support
   ```

3. **Check Browser Extensions**
   - Disable ad blockers temporarily
   - Turn off privacy extensions
   - Use incognito mode for testing

### Mobile Browser Issues

**Symptoms:**
- Touch navigation doesn't work
- Layout is cramped or unusable
- Generation fails on mobile

**Solutions:**

1. **Use Desktop When Possible**
   - AI generation works better on desktop
   - Full feature set available
   - Better performance

2. **Mobile Optimization**
   - Use landscape orientation
   - Zoom in/out for better layout
   - Use mobile browser's desktop mode

3. **Responsive Issues**
   - Report specific mobile issues
   - Include device and browser info
   - Use tablet mode if available

## API and Network Issues

### OpenAI API Errors

**Error Messages:**
- "Rate limit exceeded"
- "Invalid API key"
- "Content filtered"
- "Model overloaded"

**Solutions:**

1. **Rate Limiting**
   ```bash
   # Wait periods for different limits:
   - GPT-4: 1 minute between requests
   - DALL-E: 2 minutes between requests
   - Account limits: Check OpenAI dashboard
   ```

2. **API Key Issues**
   ```bash
   # Verify API key format:
   - Should start with 'sk-'
   - Check OpenAI account for usage
   - Regenerate key if expired
   ```

3. **Content Filtering**
   - Avoid sensitive topics
   - Use business-appropriate language
   - Simplify complex technical terms

### Network Connectivity

**Symptoms:**
- "Network error" messages
- Requests timeout
- Intermittent failures

**Solutions:**

1. **Check Connection**
   ```bash
   # Test connectivity
   ping google.com
   curl -I https://api.openai.com
   ```

2. **Firewall/Proxy Issues**
   - Check corporate firewall settings
   - Try different network (mobile hotspot)
   - Contact IT if in corporate environment

3. **DNS Issues**
   - Try different DNS servers (8.8.8.8, 1.1.1.1)
   - Flush DNS cache
   - Use VPN if geographically blocked

## Development Issues

### Local Development Setup

**Common Setup Problems:**

1. **Node.js Version**
   ```bash
   # Check Node.js version
   node --version  # Should be 18.0.0+
   npm --version   # Should be 8.0.0+
   
   # Update if needed
   nvm install 18
   nvm use 18
   ```

2. **Dependency Issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear npm cache
   npm cache clean --force
   ```

3. **Environment Variables**
   ```bash
   # Check .env.local exists
   ls -la .env.local
   
   # Verify content format
   cat .env.local
   ```

### Build Errors

**TypeScript Errors:**
```bash
# Check TypeScript
npm run type-check

# Fix common issues
npm run lint --fix
```

**Next.js Build Issues:**
```bash
# Clear build cache
rm -rf .next
npm run build

# Check for errors in console
```

### Runtime Errors

**React Hydration Errors:**
- Usually caused by server/client mismatch
- Check for browser-only code in components
- Use `useEffect` for client-side operations

**Memory Leaks:**
- Check for uncleaned useEffect
- Verify event listeners are removed
- Monitor component unmounting

## Error Reference

### Error Codes and Solutions

| Error Code | Description | Solution |
|------------|-------------|----------|
| `GENERATION_FAILED` | AI generation failed | Check API key, try again |
| `NETWORK_ERROR` | Network connectivity issue | Check internet connection |
| `STORAGE_ERROR` | Browser storage problem | Clear storage, check quota |
| `INVALID_DATA` | Data validation failed | Check input format |
| `RATE_LIMITED` | Too many API requests | Wait before retrying |
| `AUTH_ERROR` | Authentication failed | Verify API key |
| `BROWSER_ERROR` | Browser compatibility | Update browser |

### Console Error Messages

**Common JavaScript Errors:**

1. **"Cannot read property of undefined"**
   - Data not loaded yet
   - Add null checks in code
   - Use optional chaining (?.)

2. **"Storage quota exceeded"**
   - Clear browser storage
   - Export data as backup
   - Delete old content

3. **"Failed to fetch"**
   - Network connectivity issue
   - Check API endpoints
   - Verify CORS settings

4. **"Hydration mismatch"**
   - Server/client rendering difference
   - Use useEffect for client-side code
   - Check for browser-specific logic

### Getting Help

1. **Check Documentation**
   - Read relevant sections in DOCUMENTATION.md
   - Review API_DOCUMENTATION.md for API issues
   - Check DEVELOPER_GUIDE.md for technical problems

2. **Debug Information to Collect**
   ```javascript
   // Browser info
   console.log(navigator.userAgent);
   
   // Storage info
   console.log('Storage:', Object.keys(localStorage));
   
   // Error details
   console.log('Last error:', localStorage.getItem('lastError'));
   ```

3. **Report Issues**
   - Include browser and OS version
   - Provide steps to reproduce
   - Share error messages and console logs
   - Mention any recent changes or updates

---

*This troubleshooting guide is continuously updated based on user feedback and common issues. Please contribute by reporting new problems and solutions.*