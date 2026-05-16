import prisma from "@/lib/prisma";
import Link from "next/link";
import PostCard from "@/components/PostCard";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch the community from the database using the slug
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: { createdAt: "desc" }, // Shows the newest posts first!
        include: { author: true },      // Grabs the username of the person who posted it
      },
    },
  });

  // 2. If someone types a random URL like /r/does-not-exist, show a 404
  if (!community) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-6 bg-red-50 border-2 border-red-500 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Database Lookup Failed</h1>
        <p className="text-gray-700">The router successfully reached the page, but Prisma could not find a community matching the slug: <strong>{slug}</strong></p>
      </div>
    );
  }

  // 3. Render the community layout
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to r/{community.name}
        </h1>
        <p className="text-gray-500 mt-2">
          This community was successfully created and pulled from the database!
        </p>
       
        <Link 
          href={`/r/${community.slug}/submit`}
          className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
        >Create Post
        </Link>
      </div>
      
      {/* Dynamic Post Feed */}
      <div className="mt-6 flex flex-col gap-4">
        {community.posts.length === 0 ? (
          <div className="bg-white p-10 rounded-lg border border-gray-200 text-center text-gray-500">
            There are no posts here yet. Be the first to create one!
          </div>
        ) : (
          community.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}