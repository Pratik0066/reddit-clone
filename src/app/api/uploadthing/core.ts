import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// This is where we define the rules for our uploads
export const ourFileRouter = {
  // Define an endpoint named "imageUploader"
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Middleware runs BEFORE the upload starts. We use it to verify the user!
    .middleware(async () => {
      const { userId } = await auth();
      
      // If they aren't logged in, throw an error to block the upload
      if (!userId) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: userId };
    })
    // This code runs AFTER the upload is successfully completed
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // Return the URL so the frontend can grab it
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;