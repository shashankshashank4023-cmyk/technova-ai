# TechNova AI

A clean, dark-themed AI chatbot that answers questions directly and uses your own uploaded documents as extra context when they are relevant.

**Live preview:** https://claude.ai/artifact/GiNSQiq54ffEeXW7KkXbGB
*(Hosted on claude.ai. Chat there runs through Claude, so you may need to be signed in.)*

## Features

- Streaming-style chat UI with a session history sidebar
- Upload TXT, Markdown, CSV and JSON files (drag and drop or click)
- Documents are chunked and searched in the browser; the best-matching passages are sent with each question
- Answers name the source file only when it was actually used
- Chats and documents are stored in the browser (`localStorage`), nothing is kept on the server
- Serverless relay keeps the Anthropic API key off the client

## Project structure

```
technova-ai-chatbot/
├── index.html      # Entire frontend (HTML, CSS, JS)
├── api/chat.js     # Vercel serverless function that calls the Anthropic API
├── package.json
├── .env.example    # Environment variable template
├── .gitignore
├── LICENSE
└── README.md
```

## Deploy (Vercel, free)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), choose **Add New → Project**, and import the repo.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` with your key from the [Anthropic Console](https://console.anthropic.com).
4. Click **Deploy**. Vercel gives you a public URL where chat works.

Optional: set `ANTHROPIC_MODEL` to use a different model (default is `claude-sonnet-5-5`).

## Run locally

```bash
npm i -g vercel
cp .env.example .env     # then put your real key in .env
vercel dev
```

Open the local URL it prints.

## Security notes

- Your API key lives only in Vercel's environment variables. Never put it in `index.html`.
- The `/api/chat` endpoint is public, so anyone with the URL can use your API credits. Before sharing widely, add rate limiting (for example Vercel's WAF rules or Upstash Ratelimit) or put the site behind a login, and set a spend limit in the Anthropic Console.

## Limitations

- No PDF or Word support, only plain-text formats
- Retrieval is keyword-based, so very differently worded questions can miss relevant passages
- Replies arrive all at once (no token streaming yet)

## Roadmap ideas

- PDF parsing, embeddings-based search, true token streaming, user accounts

## License

MIT
