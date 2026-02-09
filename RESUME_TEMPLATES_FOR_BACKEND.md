# Resume Templates for Backend Use

This document contains the HTML/CSS templates used in the frontend for rendering resumes. These templates can be used by the backend when tailoring CVs or generating PDF exports.

## 📁 Template Files Location

**Actual HTML template files are located in**: `/templates/` directory

- `templates/classic-professional.html`
- `templates/modern-professional.html`
- `templates/minimalist-expert.html`
- `templates/sample-data.json` (for testing)
- `templates/README.md` (usage guide)

**These are the production-ready template files that the backend should use directly.**

## Template Structure

All templates use:
- **Page Size**: US Letter (8.5" x 11" / 816px x 1056px at 96 DPI)
- **Font Family**: Arial, Helvetica, sans-serif (ATS-optimized)
- **Color Scheme**: Black text on white background (no colors for ATS compatibility)
- **Sections**: Personal Info, Summary, Experience, Education, Skills

## Data Structure

The templates expect data in the following format:

```typescript
interface ResumeData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    linkedin: string
  }
  summary: string
  experience: Array<{
    id: string
    jobTitle: string
    company: string
    startDate: string  // Format: "YYYY-MM" or "YYYY"
    endDate: string
    isCurrent: boolean
    description: string  // Can contain newlines
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    startYear: string  // Format: "YYYY"
    endYear: string
    isCurrent: boolean
  }>
  skills: string[]
}
```

---

## Template 1: Classic Professional

**Template ID**: `classic-professional`

**Description**: Traditional, clean design with clear sections. ATS-optimized with sans-serif font, left-aligned header, no colors.

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: white;
      color: #111827;
      padding: 2rem;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
    }
    .header {
      border-bottom: 2px solid #1f2937;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      margin-top: 0;
    }
    .header .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .section {
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #9ca3af;
      padding-bottom: 0.25rem;
    }
    .experience-item, .education-item {
      margin-bottom: 1rem;
    }
    .experience-header, .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.25rem;
    }
    .job-title, .degree {
      font-weight: bold;
      font-size: 1rem;
    }
    .company, .school {
      color: #374151;
    }
    .date {
      color: #374151;
      text-align: right;
    }
    .description {
      margin-top: 0.5rem;
      color: #1f2937;
      white-space: pre-line;
    }
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-badge {
      background-color: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
    }
    .summary-text {
      text-align: justify;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
    <div class="contact">
      {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
      {{#if personalInfo.phone}}<span>• {{personalInfo.phone}}</span>{{/if}}
      {{#if personalInfo.location}}<span>• {{personalInfo.location}}</span>{{/if}}
      {{#if personalInfo.linkedin}}<span>• {{personalInfo.linkedin}}</span>{{/if}}
    </div>
  </div>

  <!-- Summary -->
  {{#if summary}}
  <div class="section">
    <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
    <p class="summary-text">{{summary}}</p>
  </div>
  {{/if}}

  <!-- Experience -->
  {{#if experience.length}}
  <div class="section">
    <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
    {{#each experience}}
    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">{{jobTitle}}</div>
          <div class="company">{{company}}</div>
        </div>
        <div class="date">
          {{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}
        </div>
      </div>
      {{#if description}}
      <div class="description">{{description}}</div>
      {{/if}}
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Education -->
  {{#if education.length}}
  <div class="section">
    <h2 class="section-title">EDUCATION</h2>
    {{#each education}}
    <div class="education-item">
      <div class="education-header">
        <div>
          <div class="degree">{{degree}}</div>
          <div class="school">{{school}}</div>
        </div>
        <span class="date">
          {{startYear}} - {{#if isCurrent}}Present{{else}}{{endYear}}{{/if}}
        </span>
      </div>
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Skills -->
  {{#if skills.length}}
  <div class="section">
    <h2 class="section-title">SKILLS</h2>
    <div class="skills-container">
      {{#each skills}}
      <span class="skill-badge">{{this}}</span>
      {{/each}}
    </div>
  </div>
  {{/if}}
</body>
</html>
```

### Key Features
- All caps section titles
- Bold borders for section separation
- Left-aligned header
- Right-aligned dates
- Gray backgrounds for skill badges

---

## Template 2: Modern Professional

**Template ID**: `modern-professional`

**Description**: Contemporary design with clean layout. ATS-optimized with no colors, black text only, simple borders.

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: white;
      color: #111827;
      padding: 2rem;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
    }
    .header {
      border-bottom: 2px solid #1f2937;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 1.875rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      margin-top: 0;
    }
    .header .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.875rem;
    }
    .section {
      margin-bottom: 1.5rem;
    }
    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      border-bottom: 2px solid #9ca3af;
      padding-bottom: 0.25rem;
    }
    .summary-section {
      padding-left: 1rem;
      border-left: 2px solid #9ca3af;
      margin-bottom: 1.5rem;
    }
    .summary-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .experience-item, .education-item {
      padding-left: 1rem;
      border-left: 2px solid #d1d5db;
      margin-bottom: 1rem;
    }
    .experience-header, .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.25rem;
    }
    .job-title, .degree {
      font-weight: 600;
      font-size: 1rem;
    }
    .company, .school {
      color: #111827;
      font-weight: 500;
    }
    .date {
      color: #374151;
      font-size: 0.75rem;
    }
    .description {
      margin-top: 0.5rem;
      color: #111827;
      white-space: pre-line;
      font-size: 0.75rem;
    }
    .education-date {
      color: #374151;
      font-size: 0.75rem;
    }
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-badge {
      background-color: #f3f4f6;
      color: #111827;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid #d1d5db;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
    <div class="contact">
      {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
      {{#if personalInfo.phone}}<span>• {{personalInfo.phone}}</span>{{/if}}
      {{#if personalInfo.location}}<span>• {{personalInfo.location}}</span>{{/if}}
      {{#if personalInfo.linkedin}}<span>• {{personalInfo.linkedin}}</span>{{/if}}
    </div>
  </div>

  <!-- Summary -->
  {{#if summary}}
  <div class="summary-section">
    <h2 class="summary-title">Summary</h2>
    <p>{{summary}}</p>
  </div>
  {{/if}}

  <!-- Experience -->
  {{#if experience.length}}
  <div class="section">
    <h2 class="section-title">Experience</h2>
    {{#each experience}}
    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">{{jobTitle}}</div>
          <div class="company">{{company}}</div>
        </div>
        <span class="date">
          {{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}
        </span>
      </div>
      {{#if description}}
      <div class="description">{{description}}</div>
      {{/if}}
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Education -->
  {{#if education.length}}
  <div class="section">
    <h2 class="section-title">Education</h2>
    {{#each education}}
    <div class="education-item">
      <div class="education-header">
        <div>
          <div class="degree">{{degree}}</div>
          <div class="school">{{school}}</div>
        </div>
        <span class="education-date">
          {{startYear}} - {{#if isCurrent}}Present{{else}}{{endYear}}{{/if}}
        </span>
      </div>
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Skills -->
  {{#if skills.length}}
  <div class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills-container">
      {{#each skills}}
      <span class="skill-badge">{{this}}</span>
      {{/each}}
    </div>
  </div>
  {{/if}}
</body>
</html>
```

### Key Features
- Left border accents for summary and experience items
- Smaller, more refined typography
- Bordered skill badges
- Title case section headings

---

## Template 3: Minimalist Expert

**Template ID**: `minimalist-expert`

**Description**: Clean and minimal design that emphasizes content. Lightweight typography with maximum whitespace.

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      background-color: white;
      color: #111827;
      padding: 2.5rem;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 2.25rem;
      font-weight: 300;
      margin-bottom: 0.5rem;
      margin-top: 0;
      letter-spacing: 0.05em;
    }
    .header .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #4b5563;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
      color: #6b7280;
    }
    .summary-text {
      color: #374151;
      line-height: 1.75;
    }
    .experience-item, .education-item {
      margin-bottom: 1.5rem;
    }
    .experience-header, .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .job-title, .degree {
      font-weight: 500;
      font-size: 1rem;
    }
    .company, .school {
      color: #4b5563;
      font-size: 0.75rem;
    }
    .date {
      color: #6b7280;
      font-size: 0.75rem;
    }
    .description {
      margin-top: 0.5rem;
      color: #374151;
      white-space: pre-line;
      font-size: 0.75rem;
      line-height: 1.75;
    }
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .skill-item {
      color: #374151;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>{{personalInfo.firstName}} {{personalInfo.lastName}}</h1>
    <div class="contact">
      {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
      {{#if personalInfo.phone}}<span>|</span><span>{{personalInfo.phone}}</span>{{/if}}
      {{#if personalInfo.location}}<span>|</span><span>{{personalInfo.location}}</span>{{/if}}
      {{#if personalInfo.linkedin}}<span>|</span><span>{{personalInfo.linkedin}}</span>{{/if}}
    </div>
  </div>

  <!-- Summary -->
  {{#if summary}}
  <div class="section">
    <p class="summary-text">{{summary}}</p>
  </div>
  {{/if}}

  <!-- Experience -->
  {{#if experience.length}}
  <div class="section">
    <h2 class="section-title">Experience</h2>
    {{#each experience}}
    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">{{jobTitle}}</div>
          <div class="company">{{company}}</div>
        </div>
        <span class="date">
          {{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}
        </span>
      </div>
      {{#if description}}
      <div class="description">{{description}}</div>
      {{/if}}
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Education -->
  {{#if education.length}}
  <div class="section">
    <h2 class="section-title">Education</h2>
    {{#each education}}
    <div class="education-item">
      <div class="education-header">
        <div>
          <div class="degree">{{degree}}</div>
          <div class="school">{{school}}</div>
        </div>
        <span class="date">
          {{startYear}} - {{#if isCurrent}}Present{{else}}{{endYear}}{{/if}}
        </span>
      </div>
    </div>
    {{/each}}
  </div>
  {{/if}}

  <!-- Skills -->
  {{#if skills.length}}
  <div class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills-container">
      {{#each skills}}
      <span class="skill-item">{{this}}{{#unless @last}} •{{/unless}}</span>
      {{/each}}
    </div>
  </div>
  {{/if}}
</body>
</html>
```

### Key Features
- Light font weight for name
- Uppercase, spaced section titles
- Minimal borders and decorations
- Pipe-separated contact info
- Bullet-separated skills

---

## Template Rendering Notes

### Date Formatting
- **Experience dates**: Format as `YYYY-MM` (e.g., "2020-01")
- **Education dates**: Format as `YYYY` (e.g., "2018")
- **Present**: Use "Present" when `isCurrent` is true

### Description Formatting
- Descriptions can contain newlines (`\n`)
- Use `white-space: pre-line` in CSS to preserve line breaks
- Bullet points can be represented as:
  - `•` character
  - `-` character
  - Or formatted as HTML lists

### ATS Optimization Guidelines
All templates follow these ATS-friendly principles:
1. ✅ **No colors** - Black text on white background only
2. ✅ **Sans-serif fonts** - Arial, Helvetica preferred
3. ✅ **Simple borders** - Use borders sparingly
4. ✅ **No images or graphics** - Text only
5. ✅ **Standard section names** - "Experience", "Education", "Skills"
6. ✅ **No tables** - Use divs and flexbox
7. ✅ **No headers/footers** - Single page content
8. ✅ **Standard date formats** - YYYY-MM or YYYY

### PDF Generation Considerations
When generating PDFs from these templates:
- **Page size**: 8.5" x 11" (US Letter)
- **Margins**: 0.5" to 1" recommended
- **Font size**: 10-12pt for body text
- **Line height**: 1.5-1.6 for readability
- **Break handling**: Ensure content doesn't break awkwardly across pages

---

## Template Selection

The frontend uses a template selector function:

```typescript
function getTemplateRenderer(templateId: string) {
  const renderers = {
    'classic-professional': ClassicProfessionalTemplate,
    'modern-professional': ModernProfessionalTemplate,
    'minimalist-expert': MinimalistExpertTemplate,
  }
  return renderers[templateId] || ClassicProfessionalTemplate
}
```

**Default template**: `modern-professional` (used when template is not specified)

---

## Backend Integration Suggestions

### Option 1: HTML Templates with Template Engine
Use a template engine (Jinja2, Handlebars, Mustache) to render the HTML templates with resume data.

### Option 2: CSS-in-HTML
The templates use inline CSS for portability. You can extract CSS to separate files if needed.

### Option 3: PDF Generation
Use libraries like:
- **Python**: WeasyPrint, ReportLab, pdfkit
- **Node.js**: Puppeteer, pdfkit, jsPDF
- **Other**: wkhtmltopdf, Prince XML

### Example Python/WeasyPrint Usage:
```python
from weasyPrint import HTML, CSS
from string import Template

# Load template
with open('classic-professional.html', 'r') as f:
    template = Template(f.read())

# Render with data
html_content = template.substitute(
    firstName=resume_data['personalInfo']['firstName'],
    lastName=resume_data['personalInfo']['lastName'],
    # ... etc
)

# Generate PDF
HTML(string=html_content).write_pdf('resume.pdf')
```

---

## Template Variables Reference

### Personal Info
- `{{personalInfo.firstName}}`
- `{{personalInfo.lastName}}`
- `{{personalInfo.email}}`
- `{{personalInfo.phone}}`
- `{{personalInfo.location}}`
- `{{personalInfo.linkedin}}`

### Summary
- `{{summary}}`

### Experience (Loop)
- `{{#each experience}}`
- `{{jobTitle}}`
- `{{company}}`
- `{{startDate}}`
- `{{endDate}}`
- `{{isCurrent}}` (boolean)
- `{{description}}`
- `{{/each}}`

### Education (Loop)
- `{{#each education}}`
- `{{degree}}`
- `{{school}}`
- `{{startYear}}`
- `{{endYear}}`
- `{{isCurrent}}` (boolean)
- `{{/each}}`

### Skills (Loop)
- `{{#each skills}}`
- `{{this}}` (skill name)
- `{{/each}}`

---

## Notes for Backend Implementation

1. **Conditional Rendering**: Templates use Handlebars/Mustache syntax (`{{#if}}`, `{{#each}}`). Adapt to your template engine.

2. **Whitespace**: Preserve whitespace in descriptions using `white-space: pre-line` CSS property.

3. **Page Breaks**: Consider adding `page-break-inside: avoid` to experience/education items to prevent awkward splits.

4. **Font Fallbacks**: Always include fallback fonts: `Arial, Helvetica, sans-serif`

5. **Color Values**: Use hex colors (#111827) instead of named colors for consistency.

6. **Responsive**: These templates are designed for print/PDF, not responsive web. Fixed width (816px) is intentional.

---

## Template Comparison

| Feature | Classic Professional | Modern Professional | Minimalist Expert |
|---------|---------------------|---------------------|-------------------|
| Header Style | Bold, large | Bold, medium | Light, extra large |
| Section Titles | ALL CAPS | Title Case | UPPERCASE, spaced |
| Borders | Bottom borders | Left + bottom | Minimal |
| Spacing | Standard | Standard | Extra whitespace |
| Skills Display | Badges | Badges with border | Text with bullets |
| Best For | Corporate roles | General use | Creative/tech roles |

---

## Questions?

If you need:
- Template modifications
- Additional templates
- PDF generation examples
- Integration help

Contact the frontend team or refer to the source files in `components/resume-builder/template-renderers.tsx`
