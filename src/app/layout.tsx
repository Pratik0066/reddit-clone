import type { Metadata } from "next"
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'
import Navbar from '@/components/Navbar'
import LeftSidebar from '@/components/LeftSidebar'
import MobileSidebar from '@/components/MobileSidebar'
import { Toaster } from '@/components/ui/sonner'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { extractRouterConfig } from 'uploadthing/server'
import { ourFileRouter } from '@/app/api/uploadthing/core'
import { defaultMetadata } from '@/lib/metadata'

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen scrollbar-thin bg-[#030303] text-[#d7dadc]">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#FF4500',
              colorBackground: '#030303',
              colorInputBackground: '#1a282d',
              colorText: '#d7dadc',
              colorTextSecondary: '#82959b',
            },
            elements: {
              userButtonPopoverCard: "bg-[#030303] border border-[#223237] shadow-2xl",
              userButtonPopoverActions: "text-[#d7dadc]",
              userButtonPopoverActionButton: "text-[#d7dadc] hover:bg-[#1a282d]",
              userButtonPopoverActionButtonText: "text-[#d7dadc]",
              userButtonPopoverFooter: "hidden",
              userPreviewMainIdentifier: "text-[#d7dadc]",
              userPreviewSecondaryIdentifier: "text-[#82959b]",
              organizationSwitcherTrigger: "text-[#d7dadc]",
              navButton: "text-[#82959b] hover:text-[#d7dadc]",
              activeNavButton: "text-[#ff4500]",
            },
          }}
        >
          <Navbar />
          <MobileSidebar />
          <div className="flex pt-14">
            <LeftSidebar />
            <main className="flex-1 min-w-0">
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              {children}
            </main>
          </div>
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
          />
        </ClerkProvider>
      </body>
    </html>
  )
}
