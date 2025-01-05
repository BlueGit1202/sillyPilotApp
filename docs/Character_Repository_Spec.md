# Character Repository Specification

## Overview
A character repository is a JSON-based API endpoint that serves a collection of character cards following the V2 character card specification. This document defines how repositories should structure their data to be compatible with SillyPilot.

## Repository Structure

### Base URL
A repository must provide a base URL that returns a JSON response containing repository metadata and a list of characters.

### Repository Metadata
```json
{
  "metadata": {
    "name": "Repository Name",
    "description": "Repository description",
    "version": "1.0.0",
    "author": "Repository author",
    "website": "https://optional-website.com"
  },
  "characters": [
    // Array of character objects
  ]
}
```

### Character Object Structure
Each character in the repository must follow the V2 character card specification:
```json
{
  "spec": "chara_card_v2",
  "id": "unique-character-id",
  "data": {
    "name": "Character Name",
    "description": "Character description",
    "personality": "Character personality traits",
    "scenario": "Background scenario",
    "first_mes": "First message from character",
    "avatar": "https://url-to-avatar-image.png",
    "system_prompt": "Optional system prompt for AI",
    "post_history_instructions": "Optional instructions for maintaining context",
    "creator_notes": "Optional notes from the creator",
    "character_version": "1.0.0",
    "tags": ["tag1", "tag2"],
    "creator": "Creator's name",
    "alternate_greetings": [
      "Alternative greeting 1",
      "Alternative greeting 2"
    ],
    "extensions": {
      // Optional additional data
      "world": "Character's world/setting",
      "relationships": {
        "Character Name": "Relationship description"
      }
    }
  },
  "created_at": "2024-01-20T12:00:00Z",
  "updated_at": "2024-01-20T12:00:00Z"
}
```

## API Endpoints

### Required Endpoints
- `GET /` - Returns repository metadata and full character list
- `GET /characters` - Returns only the character list
- `GET /characters/{id}` - Returns a specific character by ID

### Optional Search/Filter Endpoints
- `GET /search?q={query}` - Search characters by name/description
- `GET /categories` - List all available categories (derived from character tags)
- `GET /categories/{category}` - List characters with specific tag/category

## Implementation Requirements

### Character Images
- Avatar URLs must be publicly accessible via HTTPS
- Recommended formats: PNG, JPEG, WebP
- Maximum file size: 2MB
- Recommended dimensions: 512x512 pixels

### Rate Limiting
- Repositories should implement rate limiting to prevent abuse
- Recommended: 60 requests per minute per IP

### CORS
- Repositories must enable CORS for SillyPilot domains
- Headers should include: `Access-Control-Allow-Origin: *`

### Error Handling
Repositories should return standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

Error responses should follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Creating a Repository

### Hosting Options

1. GitHub Pages (Static)
   ```bash
   repository/
   ├── index.json           # Main repository file
   ├── characters/          # Individual character files
   │   ├── char1.json
   │   └── char2.json
   └── images/             # Character images
       ├── char1.png
       └── char2.png
   ```

2. Vercel/Netlify (Dynamic)
   ```typescript
   // api/index.ts
   export default async function handler(req, res) {
     const characters = await s()
     res.json({
       metadata: {
         name: "My Repository",
         version: "1.0.0",
         // ...
       },
       characters
     })
   }
   ```

3. Custom Server (Full Control)
   ```typescript
   import express from 'express'
   import cors from 'cors'

   const app = express()
   app.use(cors())

   app.get('/', async (req, res) => {
     const characters = await loadCharacters()
     console.log("characters", characters);
     res.json({
       metadata: { /* ... */ },
       characters
     })
   })
   ```

### Example Implementation

1. Create a new repository on GitHub
2. Add your character files following the V2 spec
3. Set up GitHub Pages or your preferred hosting
4. Test your repository with SillyPilot
5. Share your repository URL with others

See [example-character-repository.json](./example-character-repository.json) for a complete example.

## Best Practices

1. Character Quality
   - Provide detailed, well-written character descriptions
   - Include high-quality avatar images
   - Use appropriate tags for easy discovery
   - Test characters before publishing

2. Repository Maintenance
   - Keep character data up to date
   - Regularly validate character format
   - Monitor for broken image links
   - Maintain clear documentation

3. Performance
   - Implement caching for better response times
   - Optimize image sizes
   - Consider CDN for global access
   - Paginate large character lists

4. Security
   - Use HTTPS for all endpoints
   - Implement rate limiting
   - Monitor for abuse
   - Keep dependencies updated

## Testing

1. Validate Repository Format
   ```bash
   curl -X GET https://your-repository-url/
   ```

2. Check Character Format
   ```bash
   curl -X GET https://your-repository-url/characters/example-id
   ```

3. Test Search (if implemented)
   ```bash
   curl -X GET "https://your-repository-url/search?q=example"
   ```

## Common Issues

1. CORS Errors
   - Ensure proper CORS headers are set
   - Test with different origins

2. Image Issues
   - Verify image URLs are accessible
   - Check image dimensions and sizes
   - Use reliable image hosting

3. Performance
   - Implement caching
   - Optimize response sizes
   - Consider pagination

## Support

For questions or issues:
1. Check the SillyPilot documentation
2. Join our community discussions
3. Report issues on GitHub