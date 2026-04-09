# Hoogle — Deployment Setup

One-time steps to take this repo from "code-complete" to "live at
`hoogle.vikasbansal.ai`". Every step is on *your* side — the code is ready
and every build / lint / test passes in CI.

---

## Prerequisites

Install the Firebase CLI once on your machine:

```bash
npm install -g firebase-tools
firebase login
```

You also need an Anthropic API key. Get one at
<https://console.anthropic.com> → API Keys.

---

## 1. Create a Firebase project

In the [Firebase console](https://console.firebase.google.com):

1. **Add project** → name it `hoogle` (or reuse an existing project).
2. Disable Google Analytics unless you actively want it — Hoogle doesn't
   use it and it adds noise.
3. Note the **Project ID** (something like `hoogle-ab123`). You'll need it
   in step 3.

---

## 2. Upgrade to the Blaze plan

Cloud Functions need outbound HTTPS to reach the Anthropic API. The free
Spark plan blocks all outbound networking except to Google services.

1. Console → ⚙ → **Usage and billing** → **Modify plan** → **Blaze**.
2. Attach a billing account. Firebase will still keep you within the free
   tier for most small apps — Blaze just unlocks pay-per-use *if* you
   exceed the free quota.
3. Optional but recommended: set a monthly budget alert at $5 in GCP
   billing so you're not surprised.

---

## 3. Link this repo to the Firebase project

From the repo root:

```bash
firebase use --add
```

Pick your project, give it the alias `default`. This writes the project
ID into `.firebaserc` (which is now tracked but currently empty). After
this, the file should look like:

```json
{
  "projects": {
    "default": "hoogle-ab123"
  }
}
```

> ⚠ Commit this file only if you're OK with the project ID being public
> (it's not a secret, but some teams prefer to keep it out of git).

---

## 4. Enable Google Sign-In

Console → **Authentication** → **Get started** → **Sign-in method** →
**Google** → **Enable** → pick a support email → **Save**.

While you're there, add your deploy URL(s) to **Authorized domains** if
you plan to use a custom domain later (e.g. `hoogle.vikasbansal.ai`).
The default `<project>.web.app` and `<project>.firebaseapp.com` are
pre-authorised.

---

## 5. Create the Firestore database

Console → **Firestore Database** → **Create database**:

- **Native mode** (not Datastore mode).
- Pick the region closest to you. Hoogle doesn't need multi-region.
- Start in **production mode**. Security rules from `firestore.rules`
  will be deployed in step 8; until then no reads/writes succeed, which
  is the safe default.

---

## 6. Configure the web SDK (client-side config)

Console → ⚙ → **Project settings** → **General** → **Your apps** →
**Add app** → **Web** (`</>`). Register it as "Hoogle Web".

Firebase gives you a config object. Copy those values into a new
`.env.local` file at the repo root:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=hoogle-ab123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hoogle-ab123
VITE_FIREBASE_STORAGE_BUCKET=hoogle-ab123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

These values **are** shipped to the browser. That's intended and
documented — Firebase web SDK config is public identity data, not a
secret. Real security comes from Firestore rules.

> `.env.local` is already gitignored. Do not commit it.

---

## 7. Set the Anthropic secret (server-side only)

This is a real secret. It never enters the client bundle and never goes
into git.

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Paste your key when prompted. Firebase stores it in **Google Secret
Manager**; the Cloud Function binds it at cold start via the
`defineSecret()` call in `functions/src/index.ts`.

Optional model overrides (defaults shown in `functions/src/claude.ts`
already work):

```bash
firebase functions:secrets:set ANTHROPIC_MODEL_FAST   # claude-haiku-4-5
firebase functions:secrets:set ANTHROPIC_MODEL_SMART  # claude-sonnet-4-6
```

---

## 8. Deploy

From the repo root:

```bash
firebase deploy --only firestore:rules,functions,hosting
```

The `hosting` predeploy hook in `firebase.json` runs `npm run build`
automatically before uploading `dist/`, so you don't need a separate
build step. The `functions` predeploy hook runs `tsc` inside
`functions/`.

First deploy takes 2–3 minutes (Cloud Build cold-starts the function
image). Subsequent deploys are ~45 s.

---

## 9. Verify end-to-end

Open `https://<project>.web.app/hoogle` on your phone:

1. Tap **Continue with Google** → complete OAuth → land on `/hoogle/chat`.
2. Type: `Put my passport in the safe in the study.`
   → expect a one-line confirmation from Hoogle.
3. Check **Firestore** in the console: `users/{uid}/items/{id}` should
   exist with `itemName: "passport"`, `locationPath: ["study", "safe"]`.
4. Type: `where is my passport?`
   → expect "In the safe in your study." (or similar).
5. Type: `where are the batteries?`
   → expect "I don't have a record of batteries yet." (or similar — this
   verifies the no-match path).
6. Open Hoogle in browser menu → **Install app**. Confirm it appears on
   your home screen with the neon-chevron icon.
7. Open **DevTools → Network**, send another message, confirm no request
   URL or body contains `sk-ant-` — the Anthropic key stays server-side.

If any step fails, check **Cloud Functions → Logs** in the console. The
`chat` function logs every Anthropic and Firestore error with context.

---

## 10. Custom domain (optional)

Console → **Hosting** → **Add custom domain** → `hoogle.vikasbansal.ai`.
Firebase will give you DNS records to add at your registrar (A records
or a CNAME). SSL is automatic. Point the portfolio's `/hoogle` card at
the new subdomain afterwards if you want.

---

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| Login button says "Not configured yet" | `.env.local` missing or `VITE_FIREBASE_*` empty | Complete step 6 and re-run `pnpm build` |
| Chat hangs on "thinking..." | `ANTHROPIC_API_KEY` secret not set | Step 7, then redeploy functions |
| `FirebaseError: Missing or insufficient permissions` | Firestore rules not deployed or user not signed in | `firebase deploy --only firestore:rules` |
| Deploy fails: "Your project must be on the Blaze plan" | Still on Spark | Step 2 |
| `firebase use --add` says "no project" | Not logged in | `firebase login` |
| Functions deploy succeeds but chat returns 500 | Cloud Function can't read the secret | Confirm the secret binding in `functions/src/index.ts` matches the secret name exactly (`ANTHROPIC_API_KEY`) and redeploy |

---

## Everyday workflow after first deploy

Making a change and shipping it:

```bash
# Edit code…
pnpm lint
pnpm build                    # verify frontend compiles
cd functions && npm run test  # verify tool-loop tests still pass
cd ..
firebase deploy               # runs predeploy hooks automatically
```

Or just the piece you changed:

```bash
firebase deploy --only hosting    # frontend only
firebase deploy --only functions  # backend only
firebase deploy --only firestore:rules  # rules only
```
