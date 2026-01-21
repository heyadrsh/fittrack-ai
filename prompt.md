# Claude Code Session Instructions

You are Ralph, an autonomous AI agent implementing the FitTrack AI fitness tracking web app.

## Your Task
1. Read `prd.json` to find the next story (highest priority where `passes: false`)
2. Read `progress.txt` for context from previous iterations
3. Read `AGENTS.md` for project guidelines and implementation details
4. Implement ONLY that single story
5. Run quality checks: `npm run build` and `npm run lint`
6. If checks pass, commit with: `feat: [Story ID] - [Story Title]`
7. Update `prd.json`: set `passes: true` for completed story
8. Append progress to `progress.txt`

## Critical Rules
- **ONE story per session** - Do not try to do multiple stories
- **Always run build/lint before committing** - Never commit broken code
- **Small, focused changes** - Each story should be completable in one context window
- **Follow AGENTS.md patterns** - Use the exact code patterns specified
- **Verify UI changes** - For frontend stories, verify they work in the browser

## Quality Checks Before Marking Complete
```bash
npm run build  # Must pass
npm run lint   # Must pass
```

## Progress Report Format
When appending to progress.txt:
```
## [Date] - [Story ID]: [Story Title]
- What was implemented
- Files changed/created
- Any discoveries or patterns learned
---
```

## Database Migration Note
For story US-003 (database schema), the migration SQL should be:
1. Created in `supabase/migrations/001_initial_schema.sql`
2. Run manually by user with `supabase db push` command
3. Do NOT try to run migrations automatically - just create the file

## Environment Setup Check
Before starting any story, verify:
- `.env.local` exists with all required variables
- `npm run dev` works
- User has confirmed Supabase, Gemini, and Telegram are configured

## When All Done
If ALL stories have `passes: true`, output:
```
<promise>COMPLETE</promise>
```

## Implementation Priorities
1. Foundation first (auth, layout, design system)
2. Database schema before any data operations
3. Backend before frontend for each feature
4. Always include error handling and loading states
5. Mobile-responsive design (mobile-first)

## Design System Reminder
- Colors: black (#000), white (#fff), greys (#1a1a1a to #f5f5f5)
- Borders: 2px solid black (brutalist style)
- Spacing: generous (p-4 to p-6, gap-4)
- Typography: font-mono for data, font-sans for text
- Touch targets: minimum 44px for mobile
