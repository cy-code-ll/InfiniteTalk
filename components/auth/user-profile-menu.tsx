'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface UserProfileMenuProps {
  user: UserResource;
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const { signOut } = useClerk();
  const pathname = usePathname();

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl} alt={user.username || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          asChild 
          className={`focus:bg-muted hover:bg-muted cursor-pointer ${
            pathname === `/profile` ? 'bg-muted font-semibold' : ''
          }`}
        >
          <Link href={`/profile`}>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-muted hover:bg-muted"
          onClick={() => {
            console.log('用户登出');
            api.auth.clearTokens(); // 清除存储的token
            signOut();
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 