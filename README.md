# Trip Blind Box 🎁

A Burmese blind-box page: she picks one gift box, sees the weekend trip inside, chooses dates and answers.
You get an email for her pick and for her answer.

- She can pick **only one box, ever** — on any phone or browser.
- The trips stay on the server until she picks, so she can't peek in the page source.
- All the words she reads are in [`lib/content.js`](lib/content.js).

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000. Locally her pick is saved in `.data/state.json` and emails are printed in the terminal.
To pick again, delete the `.data` folder (or set `ADMIN_KEY` in `.env` and open `/api/reset?key=...`).
Restart `npm run dev` after editing `lib/content.js`.

## Deploy to Vercel

### 1. Put the code on GitHub

Create a **private** repository on GitHub and push this project to it.

### 2. Create the Vercel project

1. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
2. **Project name** — this becomes the link she sees (`<name>.vercel.app`), so don't give the surprise away.
   Something like `a-little-gift-for-you` works; avoid names like `trip-blind-box`.
3. Framework preset: **Other**. Leave the build settings empty.
4. Click **Deploy**. The first deploy works, but picking a box will fail until step 3 is done.

### 3. Add the database (remembers her pick)

1. In the Vercel project, open **Storage** → **Create Database** → **Upstash for Redis** (free plan).
2. Connect it to this project. Vercel adds the connection settings for you
   (`KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — either works).

### 4. Create a Gmail App Password

1. Turn on **2-Step Verification**: [myaccount.google.com/security](https://myaccount.google.com/security).
2. Open [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), name it `Trip Blind Box`, and copy the 16-letter password.

### 5. Add the settings

In the Vercel project: **Settings** → **Environment Variables**. Add:

| Name                 | Value                                                          |
| -------------------- | -------------------------------------------------------------- |
| `GMAIL_USER`         | your Gmail address                                             |
| `GMAIL_APP_PASSWORD` | the App Password from step 4                                   |
| `ADMIN_KEY`          | a long random secret, for your reset link — never share it     |
| `NOTIFY_TO`          | _(optional)_ another address to receive the emails             |

Then **Deployments** → the latest one → **⋯** → **Redeploy**, so the new settings are used.

### 6. Test it yourself, then reset

1. Open your link on your phone and go all the way through: pick a box → pick dates → answer.
2. Check your Gmail — you should get **two emails** (look in Spam the first time and mark them "Not spam").
3. Reload the page: it should show the box you picked, not the boxes.
4. Open `https://<your-link>/api/reset?key=<ADMIN_KEY>` — you should see `Reset done.`
5. Open the link again: the boxes are back. **Don't pick one** — it's ready for her.

Opening the link is safe; nothing is saved until a box is opened.

## After she picks

- The first email tells you which trip she picked. Add that trip's `plan` in [`lib/content.js`](lib/content.js) and push —
  Vercel redeploys and she sees the plan the next time she opens the link. Her pick and answer are kept.
- **Don't change a box's `id`** after she picked it, or her pick can't be found.
- **Don't open the reset link** after sending — it erases her pick and answer.

## Changing things

Everything is in [`lib/content.js`](lib/content.js):

| What                                     | Where                           |
| ---------------------------------------- | ------------------------------- |
| Opening words                            | `intro`                         |
| Box hints, trips, your personal lines    | `boxes`                         |
| No seafood / separate rooms / home by Sunday | `promises`                  |
| Which weekends she can pick              | `dates` (`blockedSaturdays` for weekends you can't go) |
| Answer and thank-you words               | `answerCopy`                    |

Lines only wrap at spaces, so keep a space between phrases.
