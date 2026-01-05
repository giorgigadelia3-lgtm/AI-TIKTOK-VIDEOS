# AI Art Factory Policy Site

This is a minimal, static website created to satisfy TikTok Developer Portal requirements for a verified domain.
It provides an official homepage, Terms of Service, and Privacy Policy for the AI Art Factory automation.

## What this site is for
- Public policy pages required for TikTok API app submission
- Transparent description of an internal n8n automation that publishes to a single owner-controlled TikTok account

## Files
- index.html (homepage)
- terms.html (Terms of Service)
- privacy.html (Privacy Policy)
- styles.css (shared styles)
- assets/favicon.svg (favicon placeholder)

## Placeholders to update
- CONTACT_EMAIL (replace with your real contact email)
- EFFECTIVE_DATE (set the policy effective date)

## TikTok Developer Portal URLs
After deployment, paste these into the TikTok Developer Portal:
- Web/Desktop URL: https://<your-render-domain>/
- Terms of Service URL: https://<your-render-domain>/terms.html
- Privacy Policy URL: https://<your-render-domain>/privacy.html

## Deploy on Render (static site)
1. Push this repo to GitHub.
2. In Render, click "New" -> "Static Site" and connect your GitHub repo.
3. Build Command: leave empty.
4. Publish Directory: .
5. Deploy and use the provided Render URL (or attach a custom domain).

## Local check
Open index.html in a browser and confirm the navigation links to Terms and Privacy work as expected.
