import { PrismaClient, VoteType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.vote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.community.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users (these won't be sign-in-able, but their content is visible)
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "demo_user_1",
        username: "techguru",
        email: "techguru@example.com",
        postKarma: 1420,
        commentKarma: 890,
        createdAt: new Date("2024-08-15"),
      },
    }),
    prisma.user.create({
      data: {
        id: "demo_user_2",
        username: "pixelartist",
        email: "pixel@example.com",
        postKarma: 2340,
        commentKarma: 1560,
        createdAt: new Date("2024-06-01"),
      },
    }),
    prisma.user.create({
      data: {
        id: "demo_user_3",
        username: "syntaxsorcerer",
        email: "syntax@example.com",
        postKarma: 3100,
        commentKarma: 2200,
        createdAt: new Date("2024-03-20"),
      },
    }),
    prisma.user.create({
      data: {
        id: "demo_user_4",
        username: "datadiver",
        email: "data@example.com",
        postKarma: 890,
        commentKarma: 430,
        createdAt: new Date("2024-11-01"),
      },
    }),
    prisma.user.create({
      data: {
        id: "demo_user_5",
        username: "cloudwalker",
        email: "cloud@example.com",
        postKarma: 1750,
        commentKarma: 920,
        createdAt: new Date("2024-05-10"),
      },
    }),
  ])
  console.log(`✅ Created ${users.length} demo users`)

  // Create communities
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: "Programming",
        slug: "programming",
        description:
          "A community for discussions about programming languages, software engineering, and development best practices. All skill levels welcome!",
        createdAt: new Date("2024-01-10"),
      },
    }),
    prisma.community.create({
      data: {
        name: "Gaming",
        slug: "gaming",
        description:
          "The hub for gamers! Discuss your favorite games, share clips, find teammates, and stay up to date with the gaming industry.",
        createdAt: new Date("2024-01-15"),
      },
    }),
    prisma.community.create({
      data: {
        name: "Design",
        slug: "design",
        description:
          "A place for designers of all stripes — UI/UX, graphic design, typography, and creative discussions.",
        createdAt: new Date("2024-02-01"),
      },
    }),
    prisma.community.create({
      data: {
        name: "TechNews",
        slug: "technews",
        description:
          "Breaking tech news, startup stories, product launches, and industry analysis. Stay ahead of the curve.",
        createdAt: new Date("2024-01-20"),
      },
    }),
  ])
  console.log(`✅ Created ${communities.length} communities`)

  // Create posts with varying dates for sorting
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "TypeScript 5.8 Released: What's New and Exciting",
        content:
          "The latest TypeScript release brings improved performance, better type inference, and new language features. Key highlights include faster compilation times, improved narrowing for tagged unions, and better support for decorators. The team has also made significant improvements to the developer experience with more precise error messages.\n\nWhat features are you most excited about? Let's discuss!",
        authorId: users[0].id,
        communityId: communities[0].id,
        commentCount: 24,
        createdAt: daysAgo(1),
      },
    }),
    prisma.post.create({
      data: {
        title: "I built a real-time collaborative editor in Rust — here's what I learned",
        content:
          "After 6 months of development, I finally shipped my collaborative editor. The architecture uses CRDTs for conflict resolution, WebSocket connections for real-time sync, and a custom text buffer implementation.\n\nKey takeaways:\n1. CRDTs are simpler than they sound\n2. Rust's ownership model makes concurrent editing safer\n3. WebSocket reconnection handling is critical\n\nHappy to answer questions about the implementation!",
        authorId: users[2].id,
        communityId: communities[0].id,
        commentCount: 56,
        createdAt: daysAgo(3),
      },
    }),
    prisma.post.create({
      data: {
        title: "Elden Ring Nightreign: First impressions after 20 hours",
        content:
          "I've been playing the Nightreign expansion non-stop since launch. The new areas are breathtaking, the boss fights are challenging but fair, and the lore additions are mind-blowing. My favorite new mechanic is the spirit ash customization system.\n\nSouls veterans: how are you finding the difficulty curve?",
        authorId: users[1].id,
        communityId: communities[1].id,
        commentCount: 89,
        createdAt: daysAgo(2),
      },
    }),
    prisma.post.create({
      data: {
        title: "The State of CSS in 2026: Container Queries, View Transitions, and More",
        content:
          "CSS has evolved tremendously over the past few years. Container queries are now widely supported, view transitions API is changing how we think about page navigation, and the :has() selector has revolutionized styling patterns.\n\nWe're also seeing exciting developments in CSS anchor positioning, scroll-driven animations, and the paint API. The platform is catching up to what developers have been doing with JS frameworks.",
        authorId: users[0].id,
        communityId: communities[2].id,
        commentCount: 31,
        createdAt: daysAgo(5),
      },
    }),
    prisma.post.create({
      data: {
        title: "OpenAI announces GPT-5: Everything you need to know",
        content:
          "OpenAI just unveiled GPT-5 with breakthrough capabilities in reasoning, multimodal understanding, and context handling. The model supports up to 2M tokens of context and shows significant improvements in mathematical reasoning, code generation, and long-form content creation.\n\nPricing remains competitive with the existing API tiers. Early benchmarks show a 40% improvement over GPT-4 on standard reasoning tasks.",
        authorId: users[3].id,
        communityId: communities[3].id,
        commentCount: 142,
        createdAt: daysAgo(0.5),
      },
    }),
    prisma.post.create({
      data: {
        title: "What's your unpopular opinion about React in 2026?",
        content:
          "I'll go first: Server Components are overhyped for most applications. The mental model shift isn't worth it for CRUD apps. Also, I think Zustand is a simpler state management solution than Redux or Jotai for most use cases.\n\nWhat's your hot take? Let's keep it respectful!",
        authorId: users[4].id,
        communityId: communities[0].id,
        commentCount: 214,
        createdAt: daysAgo(7),
      },
    }),
    prisma.post.create({
      data: {
        title: "Stardew Valley 2 officially announced — first trailer dropped",
        content:
          "Eric Barone just dropped the bombshell trailer for Stardew Valley 2 at the summer games showcase. The sequel introduces a new region with tropical farming, underwater exploration, and a revamped crafting system. Multiplayer will support up to 8 players with dedicated servers.\n\nRelease window: Q1 2027 on all platforms. Who else is hyped?",
        authorId: users[1].id,
        communityId: communities[1].id,
        commentCount: 67,
        createdAt: daysAgo(4),
      },
    }),
    prisma.post.create({
      data: {
        title: "Figma announces AI-powered design-to-code feature",
        content:
          "Figma's new AI feature can convert designs directly into production-ready React components. The system understands your component library, design tokens, and existing code patterns to generate clean, maintainable code.\n\nIt supports Tailwind CSS, styled-components, and CSS modules out of the box. Early access starts next month.",
        authorId: users[2].id,
        communityId: communities[2].id,
        commentCount: 45,
        createdAt: daysAgo(6),
      },
    }),
    prisma.post.create({
      data: {
        title: "Why I'm moving my startup from AWS to bare metal",
        content:
          "After 3 years and $500k in cloud costs, we're migrating to dedicated servers. The savings are projected to be 60% while getting better performance. Modern provisioning tools make bare metal almost as convenient as cloud.\n\nHere's our cost breakdown:\n- AWS: $42k/month\n- Bare metal: $15k/month (3-year lease)\n- Additional bandwidth/backup: $3k/month\n\nTotal savings: ~$24k/month",
        authorId: users[4].id,
        communityId: communities[3].id,
        commentCount: 178,
        createdAt: daysAgo(8),
      },
    }),
    prisma.post.create({
      data: {
        title:
          "PostgreSQL 19 performance improvements are insane — 3x faster analytics queries",
        content:
          "The new release introduces parallel query execution improvements, better incremental materialized views, and a new columnar storage engine for analytical workloads. Our benchmarks show:\n\n- Analytical queries: 3.2x faster\n- Concurrent write throughput: 1.8x better\n- Vacuum performance: 4x improvement\n\nUpgrade process was smooth — just a pg_upgrade and we were done in 15 minutes.",
        authorId: users[3].id,
        communityId: communities[0].id,
        commentCount: 93,
        createdAt: daysAgo(10),
      },
    }),
  ])
  console.log(`✅ Created ${posts.length} posts`)

  // Create top-level comments (no parentId)
  const topComments = await Promise.all([
    prisma.comment.create({
      data: {
        content:
          "The improved type narrowing alone is worth the upgrade. I've been using the RC and it's been rock solid.",
        authorId: users[2].id,
        postId: posts[0].id,
        createdAt: daysAgo(0.8),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Does it fix the issue with conditional types and recursive references? That's been a pain point in our codebase.",
        authorId: users[4].id,
        postId: posts[0].id,
        createdAt: daysAgo(0.7),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Congratulations on shipping! I'd love to see the CRDT implementation details. Did you use state-based or operation-based CRDTs?",
        authorId: users[0].id,
        postId: posts[1].id,
        createdAt: daysAgo(2.8),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "The new zone in the Caelid region is absolutely terrifying. I love it.",
        authorId: users[0].id,
        postId: posts[2].id,
        createdAt: daysAgo(1.8),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Container queries changed my life. No more wrapper components just for responsive layouts!",
        authorId: users[1].id,
        postId: posts[3].id,
        createdAt: daysAgo(4.5),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "The 2M token context window is a game-changer for code analysis tasks. We fed it our entire codebase and got meaningful refactoring suggestions.",
        authorId: users[0].id,
        postId: posts[4].id,
        createdAt: daysAgo(0.3),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Hard agree on Server Components. They're great for content sites but overkill for dashboards.",
        authorId: users[3].id,
        postId: posts[5].id,
        createdAt: daysAgo(6.5),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "The underwater exploration mechanic looks incredible. I hope it's as deep as it looks in the trailer.",
        authorId: users[3].id,
        postId: posts[6].id,
        createdAt: daysAgo(3.5),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "I switched to bare metal for my analytics workload and never looked back. The performance difference is night and day.",
        authorId: users[0].id,
        postId: posts[8].id,
        createdAt: daysAgo(7.5),
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "We upgraded to PG19 last week. The parallel query improvements alone made it worth it.",
        authorId: users[4].id,
        postId: posts[9].id,
        createdAt: daysAgo(9.5),
      },
    }),
  ])
  console.log(`✅ Created ${topComments.length} top-level comments`)

  // Create nested replies (with parentId)
  await prisma.comment.create({
    data: {
      content:
        "Yes! They finally addressed it. The new type instantiation heuristic handles recursive conditional types much better.",
      authorId: users[2].id,
      postId: posts[0].id,
      parentId: topComments[1].id,
      createdAt: daysAgo(0.6),
    },
  })

  const reply2 = await prisma.comment.create({
    data: {
      content:
        "State-based with delta mutators. It made snapshotting and persistence much simpler. I'll write a detailed blog post about it soon!",
      authorId: users[2].id,
      postId: posts[1].id,
      parentId: topComments[2].id,
      createdAt: daysAgo(2.7),
    },
  })

  await prisma.comment.create({
    data: {
      content:
        "Good to know about the delta approach. Looking forward to that blog post!",
      authorId: users[0].id,
      postId: posts[1].id,
      parentId: reply2.id,
      createdAt: daysAgo(2.5),
    },
  })

  console.log(`✅ Created 3 nested replies`)

  // Create votes
  const voteData: { userId: string; postId: string; type: VoteType }[] = []
  for (let i = 0; i < posts.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (users[j].id !== posts[i].authorId) {
        const type: VoteType = Math.random() > 0.2 ? "UP" : "DOWN"
        voteData.push({
          userId: users[j].id,
          postId: posts[i].id,
          type,
        })
      }
    }
  }

  await prisma.vote.createMany({ data: voteData })
  console.log(`✅ Created ${voteData.length} votes`)

  console.log("\n🎉 Seeding complete!")
  console.log(`   ${users.length} users`)
  console.log(`   ${communities.length} communities`)
  console.log(`   ${posts.length} posts`)
  const totalComments = topComments.length + 3
  console.log(`   ${totalComments} comments`)
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
