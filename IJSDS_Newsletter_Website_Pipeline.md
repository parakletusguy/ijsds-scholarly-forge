# IJSDS newsletter-to-website pipeline

This workflow turns an approved newsletter blog HTML file into a reviewed IJSDS website post. It keeps distribution and public publication as separate editorial decisions.

## 1. Prepare the two channel files

- Create the matching `-EMAIL.html` and `-BLOG.html` files in `newsletter-drafts/`.
- Review all factual claims, links, dates, and calls to action before any distribution or website work.
- The blog file is the website source; the email file is not imported into the website.

## 2. Send the email only after approval

- Prepare the email in the IJSDS editorial mailbox.
- Send only when an authorized editor explicitly approves the mailing.
- Record the send date and final subject in the editorial log.

## 3. Create a website draft

An editor opens **Admin → Blog Posts → Import Newsletter**, then uploads or pastes the matching `-BLOG.html` file.

The importer:

- extracts the newsletter's main article body;
- takes the article title and lead as the post title and excerpt;
- preserves safe semantic content, images, and links;
- removes the standalone page shell, source styles, draft label, duplicated headline, and source byline;
- assigns `Announcements` and `newsletter` as editable starting metadata; and
- saves only with `status: draft`.

No public webpage is created at this stage.

## 4. Editorial website review

The editor is taken to the existing blog editor to check:

- title, excerpt, category, tags, and featured image;
- factual wording and external links;
- formatting in the website context;
- the public URL/slug after saving; and
- whether the email and website copy still agree.

The post must remain a draft until this review is complete.

## 5. Deliberate publication

To make a reviewed post public, an editor changes its status to **Published** and confirms the public-publishing prompt. The post is then available through `/blog/:slug` and the public blog list.

## 6. Post-publication check

- Open the public post on desktop and mobile.
- Check links, page title, excerpt, featured image, and the date.
- Add the public URL to the newsletter record and retain the original HTML files.

## Safeguards

- Import never publishes automatically.
- The importer strips scripts, styles, embedded frames, event handlers, and unsafe URLs before a draft is saved.
- The source HTML remains an editorial record; it is not altered by the import.
- Publication is a separate confirmed action in the CMS.
