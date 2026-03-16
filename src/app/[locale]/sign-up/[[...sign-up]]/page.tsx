import { SignUp } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee]">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gold">PROPATI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Nigeria&apos;s verified property platform
          </p>
        </div>
        <SignUp
          afterSignUpUrl="/en/onboarding"
          signInUrl="/en/sign-in"
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full',
              card: 'shadow-none border rounded-xl',
            },
          }}
        />
      </div>
    </div>
  )
}
