
import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.session) {
          setSuccessMessage('Account created successfully!')
        } else {
          setSuccessMessage(
            'Account created. Check your email to confirm your account before signing in.',
          )
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAF7] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D1FAE5] text-2xl font-bold text-[#065F46]">
            K
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#1F2937]">
            Kinora
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Stay close to what matters.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-[#1F2937]">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          {isSignUp
            ? 'Create an account to get started with Kinora.'
            : 'Sign in to continue to your personal messaging assistant.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#1F2937]"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#1F2937]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5]"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="rounded-lg bg-[#D1FAE5] p-3 text-sm text-[#065F46]"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#065F46] px-4 py-3 font-semibold text-white transition hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          {isSignUp
            ? 'Already have an account?'
            : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className="font-semibold text-[#065F46] hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </div>
    </div>
  )
}
