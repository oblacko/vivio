import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

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
    <div
      className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10"
      style={{ backgroundColor: "rgba(244, 244, 245, 0)" }}
    >
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
