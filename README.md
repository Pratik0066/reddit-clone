# MYReddit — Reddit Clone

A full-featured Reddit clone built with Next.js, featuring a dark theme UI, Clerk authentication, and community-driven content.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Clerk
- **Database:** PostgreSQL + Prisma
- **File Uploads:** UploadThing
- **Forms:** react-hook-form + Zod

## Features

- Dark theme UI with premium color scheme (`#030303` background, `#1a282d` cards)
- User authentication via Clerk (sign in/up, profile management)
- Community system — create and join communities
- Posts with markdown formatting and image uploads
- Voting (upvote/downvote) and comment threads
- Search with live suggestions
- Infinite scroll feed with sort options (hot/new/top)
- User profiles with karma tracking and saved posts
- Responsive layout (mobile sidebar, desktop left sidebar + right panel)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, UPLOADTHING_TOKEN

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── actions/         # Server actions
├── app/
│   ├── api/         # API routes (posts, comments, votes, communities, search, upload)
│   ├── communities/ # Browse communities page
│   ├── r/           # Community pages ([slug], create, submit)
│   ├── search/      # Search results
│   ├── submit/      # Create post (global)
│   ├── u/           # User profiles
│   └── layout.tsx   # Root layout with Clerk provider
├── components/
│   ├── ui/          # shadcn-style UI primitives
│   ├── CreatePostForm.tsx
│   ├── Navbar.tsx
│   ├── LeftSidebar.tsx
│   ├── MobileSidebar.tsx
│   ├── PostCard.tsx
│   ├── CommentForm.tsx
│   └── ...
└── lib/
    ├── prisma.ts    # DB client
    ├── types.ts     # Shared types
    ├── store.ts     # Zustand stores
    └── utils.ts     # Utility functions
```
