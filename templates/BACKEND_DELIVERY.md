# Backend Delivery Package

## What to Share with Backend Team

Copy the following files to the backend repository:

### Required Files (Copy These)

1. **Template Files** (3 files):
   ```
   templates/classic-professional.html
   templates/modern-professional.html
   templates/minimalist-expert.html
   ```
   → Copy to: `backend/app/templates/resumes/`

2. **Sample Data** (for testing):
   ```
   templates/sample-data.json
   ```
   → Copy to: `backend/app/templates/resumes/` (or test directory)

3. **Quick Reference**:
   ```
   templates/README.md
   ```
   → Copy to: `backend/app/templates/resumes/README.md`

### Optional Documentation

4. **Full Documentation** (reference only):
   ```
   RESUME_TEMPLATES_FOR_BACKEND.md
   ```
   → Can be shared as reference, but not required in backend repo

---

## Quick Copy Instructions

### Option 1: Copy Files Manually

1. Copy these 4 files to backend:
   - `classic-professional.html`
   - `modern-professional.html`
   - `minimalist-expert.html`
   - `sample-data.json`

2. Place them in: `backend/app/templates/resumes/`

3. (Optional) Copy `README.md` for quick reference

### Option 2: Copy Entire Directory

```bash
# From frontend repo
cp -r templates/ /path/to/backend/app/templates/resumes/
```

### Option 3: Git Submodule (Advanced)

If templates will be updated frequently, consider a git submodule or shared package.

---

## File Structure in Backend

After copying, backend should have:

```
backend/
  app/
    templates/
      resumes/
        classic-professional.html
        modern-professional.html
        minimalist-expert.html
        sample-data.json
        README.md
```

---

## What Backend Needs to Know

### 1. Template Engine
- Templates use **Handlebars/Mustache** syntax
- Backend can use:
  - Handlebars (Node.js)
  - Jinja2 (Python) - needs conversion
  - Mustache (any language)
  - Or convert syntax to their preferred engine

### 2. Data Format
- Templates expect **camelCase** data
- Backend needs to convert from `snake_case` → `camelCase`
- See `sample-data.json` for exact format

### 3. Date Formats
- Experience: `"YYYY-MM"` (e.g., `"2020-01"`)
- Education: `"YYYY"` (e.g., `"2018"`)
- Present: Use `isCurrent: true`, template renders "Present"

### 4. Template IDs
- `classic-professional`
- `modern-professional` (default)
- `minimalist-expert`

### 5. Key Variables
- `{{personalInfo.firstName}}`
- `{{personalInfo.lastName}}`
- `{{personalInfo.email}}`
- `{{#each experience}}...{{/each}}`
- `{{#if summary}}...{{/if}}`

---

## Testing

Backend can test with `sample-data.json`:

1. Load template: `modern-professional.html`
2. Load data: `sample-data.json`
3. Render HTML
4. Generate PDF
5. Compare with frontend preview

---

## Support

If backend has questions:
- Check `templates/README.md` for quick reference
- Check `RESUME_TEMPLATES_FOR_BACKEND.md` for full documentation
- Contact frontend team for clarifications

---

## Summary Checklist

- [ ] Copy 3 HTML template files
- [ ] Copy sample-data.json
- [ ] (Optional) Copy README.md
- [ ] Place in `backend/app/templates/resumes/`
- [ ] Backend implements data normalizer (snake_case → camelCase)
- [ ] Backend implements template renderer
- [ ] Backend tests with sample data
- [ ] Backend generates PDFs
- [ ] Visual comparison with frontend preview

---

**That's it!** Just copy the 3 HTML files + sample data, and backend has everything needed.
