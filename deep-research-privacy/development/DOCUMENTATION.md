# Documentation Structure

## Overview

The Deep Research documentation is organized into several key areas:

1. **Main Documentation** (Root Directory)
   - `README.md`: Primary project documentation and getting started guide
   - `CONTRIBUTING.md`: Source of truth for contribution guidelines
   - `CODE_OF_CONDUCT.md`: Project code of conduct
   - `SECURITY.md`: Security policies and procedures
   - `LICENSE`: Project license information

2. **Website Documentation** (`/docs`)
   - `index.html`: Project landing page
   - `quickstart.html`: User-focused getting started guide
   - `about.html`: Project and team information
   - `contributing.html`: Web version of contribution guidelines (synced with CONTRIBUTING.md)

3. **Developer Documentation** (`/docs/development`)
   - `README.md`: Developer documentation overview
   - `FRONTEND_PLAN.md`: Website development planning
   - `RESEARCH_IMPROVEMENTS.md`: Research engine improvements planning

## Documentation Guidelines

1. **Content Source of Truth**
   - Root markdown files (README.md, CONTRIBUTING.md, etc.) are the source of truth
   - Website HTML files should reflect and be kept in sync with their markdown counterparts
   - Development documentation is primarily for contributors and maintainers

2. **Documentation Updates**
   - When updating guidelines in CONTRIBUTING.md, ensure contributing.html is updated
   - Development docs can be updated independently as they target different audiences
   - Website content should focus on user experience and accessibility

3. **File Organization**
   - Keep development-focused content in `/docs/development`
   - Maintain user-focused content in main `/docs` directory
   - Use assets directory for shared resources

## Website and Documentation Build Process

1. **GitHub Pages**
   - Site is built from `/docs` directory
   - HTML files required for proper rendering
   - Assets served from `/docs/assets`

2. **Development Server**
   - Run locally for testing: `cd docs && python -m http.server`
   - Test all pages before deployment
   - Verify responsive design and accessibility

3. **Content Updates**
   - Update markdown files first
   - Sync changes to corresponding HTML files
   - Maintain consistent styling and branding