import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CreatePostForm from "@/components/CreatePostForm";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubmitPostPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 1. Get the authenticated user from Clerk
  const { userId } = await auth();
  const clerkUser = await currentUser();

  // If they aren't logged in, redirect them away
  if (!userId || !clerkUser) {
    return redirect("/"); 
  }

  // 2. THE SYNC: Ensure the user exists in your Supabase database
  await prisma.user.upsert({
    where: { id: userId },
    update: {}, // Do nothing if they already exist
    create: {
      id: userId,
      // Fallback to "Anonymous" if they haven't set a name in Clerk
      username: clerkUser.firstName || "Anonymous", 
      email: clerkUser.emailAddresses[0].emailAddress,
    },
  });

  // 3. Fetch the community to ensure it exists
  const community = await prisma.community.findUnique({
    where: { slug },
  });

  if (!community) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create a post in r/{community.name}
        </h1>
      </div>

     
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
        {/* Interactive Form Component */}
      <CreatePostForm 
        communityId={community.id} 
        communitySlug={community.slug} 
      />
      </div>
    </div>
  );
}