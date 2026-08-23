# Erensan Jeneratör Production Audit

Audit date: 23 August 2026

## Architecture discovered

- Static HTML/CSS/JavaScript site deployed from GitHub to Vercel.
- No framework, router, package manager manifest, build pipeline, lint script, typecheck script, unit tests or integration tests.
- Initial inventory: 41 HTML files, 2 CSS files, 29 WebP files and 23 PNG files.
- Content rendering: pre-rendered static HTML with page-level canonical and JSON-LD data.
- Shared styling: `seo-pages.css` for service, corporate and article pages. The previous homepage used a large embedded stylesheet.
- Analytics: Vercel Web Analytics bootstrap was present on the principal root pages but not all blog articles.
- Deployment: GitHub `main` branch to the existing Vercel project. `.htaccess` is retained for Apache compatibility but does not control Vercel.

## Recorded baseline

- Homepage: 14 sections, approximately 1,244 visible words.
- Homepage repetitions: `Mersin` 36, `jeneratör` 57, `7/24` 14 and `hızlı` 13.
- Repository scan: 41 titles, 41 meta descriptions, 41 canonicals, 41 valid JSON-LD documents, 106 images, 1,294 links, 57 WhatsApp links, 99 telephone links, one `mailto:` form and two map iframes.
- One missing skip link: homepage.
- Forty pages were missing complete Twitter/X title, description and image tags.
- Homepage loaded Swiper, Font Awesome and Google Fonts from third-party CDNs.
- Homepage included a large gallery slider, a map iframe and multiple overlapping sections that repeated the same service propositions.
- The homepage used an always-visible four-button floating social rail. At 320 px this occupied approximately 44 × 206 px of the viewport.
- Desktop homepage H1 reached approximately 95–99 px and 616–643 px total height at 1,440–1,920 px viewports.
- Live URL audit showed redirect chains for HTTP/non-www variants and duplicate `index.html` and trailing-slash variants.
- All baseline local links, image files, image dimensions, image alt text and JSON-LD parsed successfully.
- No real review feed, review count, rating source or verified product catalogue was present.

## Implemented production changes

- Rebuilt the homepage as nine distinct jobs: hero, verified trust, services, working process, rental/sales decision, real field work, technical sizing guidance, verified service coverage, articles and contact action.
- Added dedicated `mersin-jenerator-onarimi.html` service content and linked it from the homepage, footer and sitemap.
- Added real field photographs to the major rental, sales, service, maintenance, repair and spare-parts service pages.
- Added contextual WhatsApp messages for rental, sales, service, maintenance, repair, spare parts and field-work enquiries.
- Added a restrained mobile `Telefon Et | WhatsApp` action bar with safe-area padding and 48 px targets.
- Added privacy-conscious Vercel conversion events without names, phone numbers, email addresses, message text, serial numbers or customer data.
- Added `businessConfig`, empty `generatorProducts` and empty `googleReviews` data stores. Empty product and review stores are intentionally not rendered.
- Changed contact-page Google Maps embed to click-to-load while preserving an ordinary directions link.
- Added complete Twitter/X card metadata to indexable pages.
- Replaced social preview PNG references with existing WebP assets.
- Removed 17 redundant PNG copies whose WebP equivalents are in use. Files remain recoverable from Git history.
- Removed Google Fonts, Swiper and Font Awesome dependencies from the homepage; removed Google Fonts from the remaining pages.
- Added system font fallbacks, visible focus styles, reduced-motion handling and a homepage skip link.
- Changed WhatsApp button text to dark ink on the original WhatsApp green for better contrast.
- Added `vercel.json` for `/index.html` redirect, trailing-slash normalization, security headers and asset caching.
- Added a useful noindex `404.html` page.
- Removed unverified `priceRange`, brand-marquee, fleet/stock, local manufacturing and “original spare part” business claims.

## Final local checks

- `node --check site.js`: passed.
- `vercel.json` JSON parse: passed.
- `site.webmanifest` JSON parse: passed.
- `sitemap.xml` XML parse: passed.
- `python scripts/validate_site.py`: passed for 43 HTML files and 42 indexable canonical URLs.
- Validator coverage: unique title and description, one H1, canonical uniqueness, full Twitter cards, valid JSON-LD, sitemap parity, internal incoming links, local link existence, image existence, alt text and dimensions.
- Local HTTP crawl: 42 sitemap URLs plus the 404 page returned HTTP 200 from the preview server.
- Browser matrix checked at 320, 360, 390, 430, 768, 1,024, 1,280, 1,440 and 1,920 px on the homepage; no horizontal overflow or undersized CTA/mobile-bar targets.
- Rental, sales, service, repair, spare-parts, blog, field-work and contact pages were additionally checked at 320, 768 and 1,024 px; no horizontal overflow or undersized primary controls.
- Contact map confirmed: zero iframe requests before consent, one correctly titled Google Maps iframe after `Haritayı Göster` activation.
- Critical flow link inventory confirmed phone, WhatsApp, rental, service, sales, contact, directions and Google Business links on their relevant pages.
- Static project has no package.json; therefore lint, typecheck, unit test and production-build scripts do not exist and were not falsely reported as passing.

## Intentionally not implemented

- No reviews/rating UI: no verified review API or supplied review dataset.
- No product cards or inventory: no verified model, kVA, price or availability data.
- No kVA calculator: a defensible result requires load and starting-characteristic engineering logic; the site instead provides conservative pre-assessment guidance.
- No case studies: photographs are real, but project problem/solution/result details were not supplied.
- No automatic district landing-page generation: existing unique district articles remain; no doorway pages were created.
- No ranking, lead, conversion, Lighthouse or Core Web Vitals improvement is claimed without post-deployment evidence.

## Business data still useful

- Verified Google review feed or approved review excerpts with source attribution.
- Verified product and rental inventory fields, only if the business wants catalogue pages.
- Written confirmation of any manufacturer authorization, certification, warranty or original-part claim before displaying it.
- Verified project facts for case studies: location, requirement, work performed and result.
- Search Console and Vercel Analytics data after deployment for evidence-based iteration.
