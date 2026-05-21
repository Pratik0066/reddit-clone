import { PrismaClient, VoteType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  await prisma.vote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.community.deleteMany()
  await prisma.user.deleteMany()

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  // ── Users (7) ──
  const users = await Promise.all([
    prisma.user.create({
      data: { id: "demo_user_1", username: "techguru", email: "techguru@example.com", postKarma: 1420, commentKarma: 890, createdAt: new Date("2024-08-15") },
    }),
    prisma.user.create({
      data: { id: "demo_user_2", username: "pixelartist", email: "pixel@example.com", postKarma: 2340, commentKarma: 1560, createdAt: new Date("2024-06-01") },
    }),
    prisma.user.create({
      data: { id: "demo_user_3", username: "syntaxsorcerer", email: "syntax@example.com", postKarma: 3100, commentKarma: 2200, createdAt: new Date("2024-03-20") },
    }),
    prisma.user.create({
      data: { id: "demo_user_4", username: "datadiver", email: "data@example.com", postKarma: 890, commentKarma: 430, createdAt: new Date("2024-11-01") },
    }),
    prisma.user.create({
      data: { id: "demo_user_5", username: "cloudwalker", email: "cloud@example.com", postKarma: 1750, commentKarma: 920, createdAt: new Date("2024-05-10") },
    }),
    prisma.user.create({
      data: { id: "demo_user_6", username: "nightowl", email: "nightowl@example.com", postKarma: 670, commentKarma: 1340, createdAt: new Date("2024-09-05") },
    }),
    prisma.user.create({
      data: { id: "demo_user_7", username: "cactusjack", email: "cactus@example.com", postKarma: 2100, commentKarma: 780, createdAt: new Date("2024-02-14") },
    }),
  ])
  console.log(`✅ ${users.length} users`)

  // ── Communities (10) ──
  const communityDefs = [
    { name: "Programming", slug: "programming", desc: "All things code — languages, frameworks, best practices, and career discussions.", created: "2024-01-10" },
    { name: "Gaming", slug: "gaming", desc: "The hub for gamers. Reviews, clips, lore, and multiplayer matchmaking.", created: "2024-01-15" },
    { name: "Design", slug: "design", desc: "UI/UX, graphic design, typography, illustration and creative critique.", created: "2024-02-01" },
    { name: "TechNews", slug: "technews", desc: "Breaking tech news, startup stories, product launches and industry analysis.", created: "2024-01-20" },
    { name: "AskReddit", slug: "askreddit", desc: "A place to ask questions and get thoughtful answers from the community.", created: "2024-03-01" },
    { name: "Movies", slug: "movies", desc: "Film discussion, reviews, recommendations, and industry news.", created: "2024-03-10" },
    { name: "Music", slug: "music", desc: "Share music, discover artists, discuss genres and gear.", created: "2024-04-01" },
    { name: "Science", slug: "science", desc: "Peer-reviewed research, breakthroughs, and casual science discussion.", created: "2024-02-15" },
    { name: "Food", slug: "food", desc: "Recipes, food photography, restaurant reviews and cooking tips.", created: "2024-04-15" },
    { name: "Sports", slug: "sports", desc: "Live match threads, trades, highlights, and analysis across all sports.", created: "2024-05-01" },
  ]

  const communities = await Promise.all(
    communityDefs.map((c) =>
      prisma.community.create({
        data: { name: c.name, slug: c.slug, description: c.desc, createdAt: new Date(c.created) },
      })
    )
  )
  console.log(`✅ ${communities.length} communities`)

  // ── Posts (3 per community = 30) ──
  const postsData: { communityIdx: number; title: string; content: string; authorIdx: number; days: number }[] = [
    // Programming
    { communityIdx: 0, authorIdx: 0, days: 1, title: "TypeScript 5.8 Released: What's New", content: "The latest TypeScript release brings improved performance, better type inference, and new language features. Key highlights include faster compilation times and improved narrowing for tagged unions.\n\nWhat features are you most excited about?" },
    { communityIdx: 0, authorIdx: 2, days: 3, title: "I built a real-time editor in Rust", content: "After 6 months I shipped my collaborative editor using CRDTs, WebSockets, and a custom text buffer. Key takeaways:\n1. CRDTs are simpler than they sound\n2. Rust's ownership model makes concurrent editing safer\n3. WebSocket reconnection handling is critical" },
    { communityIdx: 0, authorIdx: 4, days: 7, title: "What's your unpopular React opinion?", content: "I'll go first: Server Components are overhyped for most apps. The mental model shift isn't worth it for CRUD apps. Also, I think Zustand is simpler than Redux or Jotai for most use cases.\n\nWhat's your hot take?" },
    // Gaming
    { communityIdx: 1, authorIdx: 1, days: 2, title: "Elden Ring Nightreign: First impressions", content: "20 hours in and the expansion is incredible. The new areas are breathtaking, boss fights are challenging but fair, and the lore additions are mind-blowing. My favorite new mechanic is the spirit ash customization.\n\nHow are you finding the difficulty curve?" },
    { communityIdx: 1, authorIdx: 5, days: 4, title: "Stardew Valley 2 officially announced", content: "Eric Barone dropped the trailer at summer games showcase. New tropical region, underwater exploration, revamped crafting, and 8-player dedicated servers.\n\nRelease: Q1 2027. Who's hyped?" },
    { communityIdx: 1, authorIdx: 6, days: 6, title: "What game has the best soundtrack of all time?", content: "For me it's a tie between Chrono Trigger and Hollow Knight. The way the music enhances the emotional beats is unmatched.\n\nDrop your picks below." },
    // Design
    { communityIdx: 2, authorIdx: 1, days: 5, title: "The State of CSS in 2026", content: "Container queries are widely supported, view transitions API is changing page navigation, and :has() has revolutionized styling. CSS anchor positioning and scroll-driven animations are the next big things.\n\nThe platform is catching up to JS frameworks." },
    { communityIdx: 2, authorIdx: 2, days: 6, title: "Figma AI design-to-code is here", content: "Figma's new AI converts designs directly into production-ready React components. It understands your component library, design tokens, and existing code patterns to generate clean, maintainable code.\n\nSupports Tailwind, styled-components, and CSS modules." },
    { communityIdx: 2, authorIdx: 3, days: 9, title: "Dark mode design principles", content: "After redesigning 5 apps for dark mode, here's what I learned:\n- Use true black sparingly (#030303 for deep bg, #1a282d for surfaces)\n- Reduce saturation in dark mode\n- Ensure text contrast ratios are maintained\n- Test in bright sunlight" },
    // TechNews
    { communityIdx: 3, authorIdx: 3, days: 0.5, title: "OpenAI announces GPT-5", content: "GPT-5 brings breakthrough reasoning, 2M token context, and 40% improvement over GPT-4 on standard benchmarks. Multimodal understanding is significantly enhanced.\n\nPricing remains competitive with existing API tiers." },
    { communityIdx: 3, authorIdx: 4, days: 8, title: "Moving my startup from AWS to bare metal", content: "After 3 years and $500k in cloud costs, we're migrating to dedicated servers. Savings: 60% with better performance. Modern provisioning tools make bare metal almost as convenient as cloud.\n\nAWS: $42k/mo → Bare metal: $15k/mo" },
    { communityIdx: 3, authorIdx: 6, days: 11, title: "The Android vs iOS debate in 2026", content: "Both platforms have matured significantly. Android's customization and iOS's ecosystem integration are the main differentiators now. With RCS adoption, even messaging is finally unified.\n\nWhich side are you on and why?" },
    // AskReddit
    { communityIdx: 4, authorIdx: 5, days: 1.5, title: "What's a skill that looks impressive but is actually easy to learn?", content: "I'll start: touch typing. With 30 minutes of practice a day for two weeks, anyone can get to 60+ WPM. It looks impressive in an office setting but the technique is straightforward.\n\nWhat's yours?" },
    { communityIdx: 4, authorIdx: 0, days: 4.5, title: "People over 40, what do you wish you'd known at 25?", content: "Career, relationships, health, finance — any wisdom you'd pass along to your younger self? I'm 27 and trying to make good decisions now that future me will be grateful for." },
    { communityIdx: 4, authorIdx: 6, days: 8.5, title: "What purchase under $100 changed your life?", content: "For me it was a white noise machine. My sleep quality improved dramatically and it paid for itself in better productivity within a week.\n\nWhat's your best cheap life upgrade?" },
    // Movies
    { communityIdx: 5, authorIdx: 2, days: 3.5, title: "Best sci-fi movies of the decade so far", content: "Dune Part Two, Everything Everywhere All At Once, The Creator, and Asteroid City are my top picks. The visual storytelling and original concepts are pushing the genre forward.\n\nWhat am I missing?" },
    { communityIdx: 5, authorIdx: 5, days: 6.5, title: "Hot take: practical effects > CGI every time", content: "Mad Max Fury Road, The Thing, Jurassic Park — movies that rely on practical effects age infinitely better than CGI-heavy blockbusters. The weight and texture of real sets and props is something digital can't replicate.\n\nChange my mind." },
    { communityIdx: 5, authorIdx: 1, days: 10, title: "Underrated movies that deserve more love", content: "The Fall (2006), Moon (2009), and The Secret Life of Walter Mitty (2013) are three films I never see discussed but are masterpieces in their own right.\n\nAdd your underrated gems below." },
    // Music
    { communityIdx: 6, authorIdx: 3, days: 5.5, title: "What album has no skips?", content: "For me: Daft Punk — Random Access Memories, Kendrick Lamar — To Pimp a Butterfly, and Fleetwood Mac — Rumours. Every single track is essential.\n\nWhat are your no-skip albums?" },
    { communityIdx: 6, authorIdx: 0, days: 7.5, title: "How streaming changed music production", content: "The shift to streaming has fundamentally changed how music is produced. Songs are shorter, intros are nearly extinct, and hooks hit within the first 10 seconds. The playlist economy rewards consistency over experimentation.\n\nIs this good for art?" },
    { communityIdx: 6, authorIdx: 4, days: 12, title: "I'm learning guitar at 30 — tips welcome", content: "Always wanted to learn but never had the time. Finally bought a Yamaha FG800 and started JustinGuitar's beginner course. My fingers hurt but I'm loving every minute.\n\nAny advice for adult beginners?" },
    // Science
    { communityIdx: 7, authorIdx: 2, days: 2.5, title: "NASA's Artemis base camp plans revealed", content: "NASA released detailed plans for a permanent lunar base at the south pole. The architecture uses modular habitats, in-situ resource utilization for water and fuel, and a nuclear reactor for power.\n\nTarget: crewed landing by 2028." },
    { communityIdx: 7, authorIdx: 3, days: 9.5, title: "CRISPR breakthrough cures sickle cell in trial", content: "Groundbreaking results from the Phase 3 trial show 97% of patients symptom-free after a single CRISPR treatment. The therapy edits the patient's own stem cells to produce fetal hemoglobin, compensating for the genetic defect.\n\nCost remains a concern for widespread adoption." },
    { communityIdx: 7, authorIdx: 6, days: 13, title: "Why is the universe expanding faster than expected?", content: "The Hubble tension — the discrepancy between local and early-universe expansion rate measurements — continues to puzzle cosmologists. New JWST data rules out measurement error for local measurements, suggesting new physics may be needed.\n\nDark energy or modified gravity?" },
    // Food
    { communityIdx: 8, authorIdx: 5, days: 4.8, title: "I perfected sourdough after 2 years", content: "After countless failed loaves, I finally cracked the code. The secrets:\n1. Maintain a consistent starter feeding schedule\n2. Cold ferment for 24+ hours\n3. Use a Dutch oven for steam\n4. Score deeper than you think\n\nHere's my recipe and process." },
    { communityIdx: 8, authorIdx: 1, days: 8.2, title: "Best cities for street food in Asia", content: "Bangkok, Singapore, Tokyo, and Penang are my top tier. The diversity of flavors, the energy of the markets, and the ridiculously low prices make street food the best way to experience Asian cuisine.\n\nWhich city am I sleeping on?" },
    { communityIdx: 8, authorIdx: 4, days: 14, title: "What's your go-to lazy but healthy meal?", content: "Mine is a sheet pan dinner: chickpeas, sweet potato, broccoli, and chicken thigh tossed in olive oil and spices, roasted at 425°F for 25 minutes. Minimal cleanup, maximum nutrition.\n\nShare your lazy healthy meals!" },
    // Sports
    { communityIdx: 9, authorIdx: 0, days: 3.2, title: "Is this the best Premier League season ever?", content: "The title race is down to three teams with 10 games left. Record-breaking goal tallies, young talent emerging, and multiple managers redefining tactics. Every match week has drama.\n\nWho takes it: City, Arsenal, or Liverpool?" },
    { communityIdx: 9, authorIdx: 6, days: 7.2, title: "The impact of analytics on modern basketball", content: "The three-point revolution has changed the NBA forever. While purists complain about the style, the data clearly shows efficient offense requires spacing and volume three-point shooting.\n\nHas analytics made the game better or more predictable?" },
    { communityIdx: 9, authorIdx: 2, days: 11, title: "Olympic sports that should be added", content: "My picks: Parkour, competitive eating, drone racing, and breakdancing (finally happening!). What niche or emerging sport deserves Olympic status?\n\nAlso, bring back tug of war." },
  ]

  const posts = await Promise.all(
    postsData.map((p) =>
      prisma.post.create({
        data: {
          title: p.title,
          content: p.content,
          authorId: users[p.authorIdx].id,
          communityId: communities[p.communityIdx].id,
          commentCount: 0,
          createdAt: daysAgo(p.days),
        },
      })
    )
  )
  console.log(`✅ ${posts.length} posts`)

  // ── Comments (5 per post = ~150) ──
  const commentAuthors = [0, 1, 2, 3, 4, 5, 6]
  const commentTexts = [
    "Great post! I've been saying this for years. Thanks for putting it so clearly.",
    "This is really helpful, thanks for sharing your experience.",
    "I disagree with some points here. Have you considered the alternative approach?",
    "Can you elaborate on this? I'm trying to understand the implications better.",
    "Finally someone said it. I've been downvoted to oblivion for suggesting this.",
    "The data doesn't support this claim. Here's a study that shows the opposite results.",
    "I tried this and it worked perfectly. One tip: make sure to double-check the configuration first.",
    "This changed my workflow completely. Can't believe I didn't know about this sooner.",
    "Replying to bookmark this. Saving for later reference!",
    "As someone with 10 years in this field, I can confirm everything said here is accurate.",
    "Has anyone else experienced issues with the newer version? Mine keeps crashing on startup.",
    "The community aspect is what makes this special. Love seeing everyone share their knowledge.",
    "I built something similar but used a different stack. Happy to share my approach if anyone's interested.",
    "This deserves way more upvotes. Quality content right here.",
    "Can we talk about the implications for privacy though? That part concerns me.",
    "Step 3 is crucial. I skipped it on my first attempt and wasted hours debugging.",
    "I've been waiting for someone to make this post. Thank you!",
    "Not sure I follow the logic in paragraph 2. Could you rephrase?",
    "The timing of this post is perfect. I was just researching this exact topic.",
    "Visual learner here — any chance you could make a video tutorial too?",
  ]

  interface CommentRecord {
    id: string
    postId: string
    authorId: string
    depth: number
  }

  const allComments: CommentRecord[] = []

  for (let pi = 0; pi < posts.length; pi++) {
    // 4-6 top-level comments per post
    const numTop = 4 + (pi % 3)
    const topIds: string[] = []

    for (let ci = 0; ci < numTop; ci++) {
      const authorIdx = commentAuthors[(pi * 7 + ci * 3 + 1) % commentAuthors.length]
      const textIdx = (pi * 5 + ci) % commentTexts.length
      const comment = await prisma.comment.create({
        data: {
          content: commentTexts[textIdx],
          authorId: users[authorIdx].id,
          postId: posts[pi].id,
          createdAt: daysAgo(postsData[pi].days - 0.1 - ci * 0.05),
        },
      })
      topIds.push(comment.id)
      allComments.push({ id: comment.id, postId: posts[pi].id, authorId: users[authorIdx].id, depth: 0 })
    }

    // 1-2 nested replies per post on the first top-level comment
    const numReplies = 1 + (pi % 2)
    let parentId: string | undefined = topIds[0]
    for (let ri = 0; ri < numReplies; ri++) {
      const authorIdx = commentAuthors[(pi * 11 + ri * 7 + 3) % commentAuthors.length]
      const textIdx = (pi * 7 + ri * 3 + 2) % commentTexts.length
      const reply = await prisma.comment.create({
        data: {
          content: commentTexts[textIdx],
          authorId: users[authorIdx].id,
          postId: posts[pi].id,
          parentId,
          createdAt: daysAgo(postsData[pi].days - 0.15 - ri * 0.03),
        },
      })
      allComments.push({ id: reply.id, postId: posts[pi].id, authorId: users[authorIdx].id, depth: ri + 1 })
      parentId = reply.id
    }
  }
  console.log(`✅ ${allComments.length} comments`)

  // Update comment counts on posts
  for (const post of posts) {
    const count = allComments.filter((c) => c.postId === post.id).length
    await prisma.post.update({ where: { id: post.id }, data: { commentCount: count } })
  }

  // ── Votes (each user votes on each post, biased 80% up) ──
  const voteData: { userId: string; postId: string; type: VoteType }[] = []
  for (const post of posts) {
    for (const user of users) {
      if (user.id !== post.authorId) {
        voteData.push({ userId: user.id, postId: post.id, type: Math.random() > 0.2 ? "UP" : "DOWN" })
      }
    }
  }
  await prisma.vote.createMany({ data: voteData })
  console.log(`✅ ${voteData.length} votes`)

  // ── Summary ──
  console.log("\n🎉 Seeding complete!")
  console.log(`   ${users.length} users`)
  console.log(`   ${communities.length} communities`)
  console.log(`   ${posts.length} posts`)
  console.log(`   ${allComments.length} comments`)
  console.log(`   ${voteData.length} votes`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
