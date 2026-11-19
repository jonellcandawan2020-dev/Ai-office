# Virtual AI Company — First Version

A premium dark-mode, iPhone-friendly PWA starter for a virtual general-purpose AI company.

## Included in v1
- CEO command-center dashboard
- Five AI employee profiles: Manager, Secretary, Marketing, Finance, Research
- Task creation, assignment, completion tracking, and local persistence
- Department chat interface
- Demo responses when no API key is configured
- Optional server-side OpenAI Responses API connection
- PWA manifest, service worker, and app icon
- Exportable task report

## Important limitations
This is a first working version, not a fully autonomous company yet. Tasks are stored in the browser on the device. It does not yet connect to email, calendars, payment systems, or external accounts. AI can plan and draft; require human approval before external, financial, irreversible, or privacy-impacting actions.

## Run locally
Requires Node.js 20 or newer.

1. Install Node.js.
2. Run `npm start` in this folder.
3. Open `http://localhost:3000`.

No npm packages are required by the server.

## Enable live AI (optional)
1. Create an API key in the OpenAI Platform.
2. Set `OPENAI_API_KEY` in the hosting provider's private environment variables.
3. Optionally set `OPENAI_MODEL` to a model available to your API project.
4. Restart the server.

Never put the API key in `public/`, HTML, or browser JavaScript. API usage is billed separately from a ChatGPT subscription.

## Deploy for iPhone
Deploy to a Node.js-compatible hosting provider that supports environment variables. Then open the HTTPS app URL in Safari on iPhone, tap Share, and choose Add to Home Screen.

## Next milestones
- Persistent cloud database and user authentication
- Real task delegation from Manager to specialist agents
- Approval queue for external actions
- Connected tools with explicit permissions
- Audit log, spending limits, and per-agent usage limits
