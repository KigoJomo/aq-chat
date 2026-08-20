# AQ Chat

A signed-in Gemini chat app with streamed replies and saved conversation history.

[Open AQ Chat](https://aqchat.vercel.app)

## What it does

- signs users in with Clerk
- streams replies from Gemini
- stores chats and messages in MongoDB
- lists recent chats and allows renaming or deletion
- renders Markdown, tables, and syntax-highlighted code
- copies code blocks to the clipboard
- keeps the layout usable on phones and desktops

The default model is `gemini-2.0-flash`. This is a personal experiment, not a general-purpose hosted assistant. API usage is charged to the configured Google account.

## Run it locally

```bash
npm install
npm run dev
```

Create `.env.local` with a Gemini key, MongoDB connection, and Clerk application keys.

```dotenv
GEMINI_API_KEY=your-key
MONGODB_URI=mongodb://localhost:27017/aq-chat
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
CLERK_SECRET_KEY=your-key
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
```

The repository currently has no automated test suite.
