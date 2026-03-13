# rental_names

Static guest intake form for accommodation rentals.

## What it does

- Runs as a plain static website
- Reads stay dates from the page URL, for example:
  - `?start=2026-06-01&end=2026-06-07`
- Lets the guest fill in up to 6 guests
- Sends the form by email using EmailJS
- Does not store guest data in a database

## Configure email sending

1. Create an account at EmailJS
2. Create an email service
3. Create an email template
4. Replace these values in [public/app.js](/Users/cetfsousa/Developer/dev/rental_names/public/app.js):
   - `publicKey`
   - `serviceId`
   - `templateId`
   - `toEmail`

Suggested template variables:

- `{{to_email}}`
- `{{start_date}}`
- `{{end_date}}`
- `{{guest_count}}`
- `{{guests_text}}`
- `{{guests_html}}`

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`

## Share links

Example:

```text
http://localhost:3000/?start=2026-06-01&end=2026-06-07
```

When deployed as a static site, replace `localhost:3000` with your real site URL.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. In GitHub, open `Settings > Pages`
3. Set `Source` to `GitHub Actions`
4. Push to the `main` branch

The workflow in [.github/workflows/deploy-pages.yml](/Users/cetfsousa/Developer/dev/rental_names/.github/workflows/deploy-pages.yml) publishes the contents of [public](/Users/cetfsousa/Developer/dev/rental_names/public) to GitHub Pages.
