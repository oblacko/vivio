import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SignupForm = dynamic(() => import("@/components/signup-form").then(mod => ({ default: mod.SignupForm })), {
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
  ssr: false
});

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  )
}
