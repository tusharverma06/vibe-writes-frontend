import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">Loading...</h2>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we load the page</p>
      </div>
    </div>
  );
}

