import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee]">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gold">PROPATI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your verified property platform
          </p>
        </div>
        <SignIn
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
