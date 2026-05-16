import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 h-14">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl hidden sm:block text-orange-500">
            RedditClone
          </span>
        </Link>

        {/* Search Bar Placeholder (For later) */}
        <div className="hidden md:flex max-w-lg w-full bg-gray-100 rounded-full px-4 py-1.5 items-center border border-transparent hover:border-blue-500 transition">
          <input 
            type="text" 
            placeholder="Search RedditClone..." 
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition">Log In</button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

      </div>
    </nav>
  );
}