"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import ToggleDarkmode from "../ui/ToggleDarkmode";
import { SearchCheckIcon, Menu, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between p-2 md:p-3 mx-10 md:mx-20 lg:mx:50 xl:mx-80 bg-background backdrop-blur-md rounded-lg border border-border shadow-xs">
      <div className="flex items-center gap-2 ml-1">
        {/* Left - Title and logo */}
        <Link href='/' className="flex items-center gap-2 hover:opacity-60 transition duration-200">
          <SearchCheckIcon strokeWidth={1.5} />
          <h2 className="font-bold">Buildr</h2>
        </Link>
        {/* Nav links */}
        <div className="hidden md:flex">
          <Link href='/search'>
            <Button variant='ghost' size='sm'>Get started</Button>
          </Link>
          <Link href='#'>
            <Button variant='ghost' size='sm'>Docs</Button>
          </Link>
        </div>
      </div>
      {/* Right side div */}
      <div className="flex items-center gap-1 md:gap-2">
        <ToggleDarkmode />
        
        {/* Authentication button */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 h-8 w-8">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || <User size={16} />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium">
                {session?.user?.name || "User"}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground truncate">
                {session?.user?.email || ""}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" onClick={() => signIn()} className="hidden md:flex">
            Sign in
          </Button>
        )}
        
        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          {!isAuthenticated && (
            <Button variant="outline" size="sm" onClick={() => signIn()}>
              Sign in
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Menu className="scale-120" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/" className="w-full cursor-pointer">
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/editor" className="w-full cursor-pointer">
                  Get Started
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="w-full cursor-pointer">
                  Docs
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;