'use client';

import { 
  SignInButton, 
  UserButton, 
  useUser, 
  useClerk
} from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import UserProfileMenu from './user-profile-menu';

export default function AuthButton() {

  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  if (isSignedIn && user) {
    return (
      <UserProfileMenu user={user} />
    );
  }

  return (
    <Button
      variant="default"
      className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-full transition-colors"
      onClick={() => openSignIn()}
    >
      Login
    </Button>
  );
} 