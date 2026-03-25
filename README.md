
##Thoughtful / TRUE Thoughts
An application that makes you think about what you are reading and writing; a tool for thought application designed to combat cognitive decline in the age of generative AI.

Core Philosophy: Productive Resistance
Unlike standard AI assistants that aim for "frictionless" completion, Thoughtful is built on the principle of Productive Resistance. The AI's role is not to help the user finish faster, but to ensure they finish smarter. The system is forbidden from writing for the user; it is permitted only to challenge, recall, and provoke.

##Target User
University students, academics, and writers who feel overwhelmed by information or overly dependent on AI summaries. These users need to develop deep analytical skills but struggle with the "blank page" and "active reading." Their primary pain point is the "illusion of learning" passing a class or finishing a paper without actually mastering the underlying material.

##Features

###Must Have
•	Feature 1: The Perspective Lens Reader
o	A text input pane where users can paste text or upload source material.
o	A dropdown to apply "Lenses" (e.g., The Skeptic, The Exam-Maker, The Business Auditor).
o	The AI annotates the source text with clickable "Hotspots" that pose challenging questions rather than providing summaries to force deeper engagement.
•	Feature 2: The Logic Scaffolder
o	A middle pane where users drag and drop evidence from the Reader to build an argument map.
o	Users must manually title each node and write a "Claim" connecting the evidence to their specific argument.
o	This pane acts as a "Gatekeeper": the final editor is restricted/locked until the user has created at least 3 distinct nodes.
•	Feature 3: The Provocative Editor (with Contextual Recall)
o	A rich text editor with a "Lurking AI" process that monitors user input in real-time.
o	Triggers "Provocations" (Socratic challenges) after 10 words or a single sentence (triggered on a 3-second pause).
o	The AI cross-references the draft against the Source Text and Scaffold Nodes to find logical leaps or contradictions.
o	Resolution Logic: Clicking a provocation highlight surfaces the related "Scaffold Node" and its source quote to remind the student of their own previous insights, assisting resolution through synthesis.

###Should Have
•	Feature 4: Spatial Workspace Layout
o	A fixed 3-pane layout inspired by NotebookLM (Left: Reader, Middle: Scaffolder, Right: Editor).
o	Left Pane includes a vertical list of sources and the active reading view with toggleable lenses.
o	Middle Pane is a vertical feed of "Claim Cards" that replace the traditional chat box interface.
o	Right Pane features a clean writing space with a dedicated "Provocation Margin" for Socratic challenges.
•	Feature 5: Hybrid Source Input
o	Integration with a PDF parser to extract text directly into the Reader pane.
o	A manual paste option for web articles or digitized notes.
•	Feature 6: Session Persistence
o	A sidebar to save and switch between different sessions stored in the local JSON database.
•	Feature 7: Export to Markdown
o	Ability to export the final draft and associated scaffold nodes for academic use.
Could Have
•	Feature 8: Focus Mode
o	A UI theme that dims the Reader and Scaffolder panes while the user is actively writing in the Editor.
•	Feature 9: Citation Auto-Generator
o	Automatically creates a bibliography based on the quotes and source references mapped in the Scaffolder.
Data Model
The app uses a flat-file JSON database (db.json) to track the thinking journey.
•	Session: id, title, source_text, active_lens, created_at
•	ScaffoldNode: id, session_id, evidence_quote, student_claim, order_index
•	Provocation: id, target_text_range, challenge_text, related_node_id, status (pending/resolved)
•	Draft: session_id, content, last_trigger_word_count
Tech Stack
•	Next.js 14 (App Router)
•	TypeScript
•	Tailwind CSS
•	JSON-based Local Database
•	Deployed on Vercel
Design
•	Concept: A clean, fixed three-column layout following the NotebookLM structural reference.
•	Palette: Dark Mode Academic (Deep grays, off-white "Paper" text, academic blue accents, and subtle red for provocations).
•	Figma Link: [To be added after Stitch AI export]
Live Demo
•	Vercel URL: [To be added after first deployment]

##Deploy to Vercel
https://thoughtful-chi.vercel.app/

(found these here)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
