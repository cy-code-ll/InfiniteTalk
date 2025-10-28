import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ShareNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Image src="/logo.webp" alt="InfiniteTalk" width={80} height={80} className="mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold text-card-foreground mb-4">
          Video Not Found
        </h1>
        
        <p className="text-muted-foreground mb-8">
          The video you're looking for doesn't exist or has been removed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/infinitetalk">
            <Button>
              Create Your Own Video
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

