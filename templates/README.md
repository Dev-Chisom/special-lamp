# Resume Templates for Backend

This directory contains the HTML template files used for resume rendering. These templates are shared between the frontend preview and backend PDF generation to ensure pixel-perfect parity.

## Files

- `classic-professional.html` - Traditional, all-caps sections
- `modern-professional.html` - Contemporary with left borders (default)
- `minimalist-expert.html` - Clean, minimal design

## Template Format

- **Syntax**: Handlebars/Mustache
- **CSS**: Inline (self-contained, no external dependencies)
- **Page Size**: US Letter (8.5" x 11" / 816px x 1056px)
- **Fonts**: System fonts only (Arial, Helvetica, sans-serif)
- **Colors**: Grayscale only (ATS-compliant)

## Data Structure

Templates expect data in camelCase format:

```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "(555) 123-4567",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "id": "1",
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Corp",
      "startDate": "2020-01",
      "endDate": "",
      "isCurrent": true,
      "description": "• Led development..."
    }
  ],
  "education": [
    {
      "id": "1",
      "school": "University of California",
      "degree": "Bachelor of Science",
      "startYear": "2014",
      "endYear": "2018",
      "isCurrent": false
    }
  ],
  "skills": ["React", "TypeScript", "Node.js"]
}
```

## Template Variables

### Personal Info
- `{{personalInfo.firstName}}`
- `{{personalInfo.lastName}}`
- `{{personalInfo.email}}`
- `{{personalInfo.phone}}`
- `{{personalInfo.location}}`
- `{{personalInfo.linkedin}}`

### Summary
- `{{summary}}`

### Experience Loop
```handlebars
{{#each experience}}
  {{jobTitle}}
  {{company}}
  {{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}
  {{description}}
{{/each}}
```

### Education Loop
```handlebars
{{#each education}}
  {{degree}}
  {{school}}
  {{startYear}} - {{#if isCurrent}}Present{{else}}{{endYear}}{{/if}}
{{/each}}
```

### Skills Loop
```handlebars
{{#each skills}}
  {{this}}
{{/each}}
```

## Date Formats

- **Experience dates**: `"YYYY-MM"` (e.g., `"2020-01"`, `"2023-12"`)
- **Education dates**: `"YYYY"` (e.g., `"2018"`, `"2022"`)
- **Present**: Use `isCurrent: true`, template will render "Present"

## Description Formatting

- Descriptions can contain newlines (`\n`)
- CSS uses `white-space: pre-line` to preserve line breaks
- Bullet points should be included in description text (e.g., `"• Point 1\n• Point 2"`)

## Usage

### Backend Integration

1. Copy templates to `backend/app/templates/resumes/`
2. Use Handlebars-compatible template engine (or convert to Jinja2)
3. Normalize backend data to camelCase format
4. Render HTML
5. Generate PDF using Playwright or similar

### Example (Python/Handlebars)

```python
import handlebars

with open('templates/modern-professional.html', 'r') as f:
    template = handlebars.compile(f.read())

html = template.render(resume_data)
```

## ATS Compliance

All templates are ATS-optimized:
- ✅ No colors (grayscale only)
- ✅ No images or graphics
- ✅ No tables
- ✅ Sans-serif fonts
- ✅ Simple borders
- ✅ Standard section names
- ✅ Text-only content

## Notes

- Templates are self-contained (no external CSS/JS)
- All styles are inline
- Print media queries included for PDF generation
- Page break controls prevent awkward splits
- Default template: `modern-professional`

## Version

**Version**: 1.0  
**Last Updated**: 2024  
**Compatible With**: Frontend preview components
