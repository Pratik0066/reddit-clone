import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import Navbar from '@/components/Navbar' // Import your new Navbar

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 pt-14"> 
          {/* pt-14 pushes the page content down so it doesn't hide behind the fixed navbar */}
          <Navbar />
          <main className="max-w-7xl mx-auto p-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}