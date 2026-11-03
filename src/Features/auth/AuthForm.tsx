import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Mail,
  MessageCircleHeart,
  UsersRound,
} from "lucide-react";
import KinoraLogo from "../../Components/branding/KinoraLogo";
import ThemeToggle from "../../Components/branding/ThemeToggle";
import { supabase } from "../../lib/supabaseClient";

interface AuthFormProps {
  onAccountCreationStart?: () => void;
  onAccountCreationComplete?: () => void;
}

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login credentials")) {
    return "That email and password combination doesn't match. Check your details and try again.";
  }
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (message.includes("password") && (message.includes("short") || message.includes("least"))) {
    return "Choose a longer password and try again.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email from the message we sent before signing in.";
  }
  return "We couldn't complete that request. Please check your details and try again.";
}

export default function AuthForm({ onAccountCreationStart, onAccountCreationComplete }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage("Your passwords don't match yet. Check them and try again.");
      return;
    }

    setLoading(true);
    const creatingAccount = isSignUp;
    if (creatingAccount) onAccountCreationStart?.();

    try {
      if (creatingAccount) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.session) {
          const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
          if (signOutError) throw signOutError;
        }

        setPassword("");
        setConfirmPassword("");
        setIsSignUp(false);
        setSuccessMessage(
          data.session
            ? "Your account is ready. Sign in below to open your Kinora workspace."
            : "Your account was created. Check your inbox to confirm your email, then sign in below.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(friendlyAuthError(error));
    } finally {
      if (creatingAccount) onAccountCreationComplete?.();
      setLoading(false);
    }
  }

  function switchMode(nextMode: boolean) {
    setIsSignUp(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="auth-shell relative flex min-h-screen flex-col px-4 py-5 sm:px-6 sm:py-7">
      <div aria-hidden="true" className="auth-page-glow pointer-events-none fixed inset-0" />
      <div className="auth-topbar relative z-10 mx-auto flex w-full max-w-[1240px] justify-end">
        <ThemeToggle />
      </div>

      <div className="auth-layout relative z-10 mx-auto my-auto grid w-full max-w-[1240px] grid-cols-1 items-stretch gap-5 py-6 lg:grid-cols-[1.04fr_.96fr] lg:gap-6 lg:py-10">
        <section className="auth-story-panel relative isolate flex min-h-[300px] flex-col overflow-hidden rounded-[28px] p-6 sm:p-9 lg:min-h-[650px] lg:rounded-[32px] lg:p-11">
          <div aria-hidden="true" className="auth-story-glow pointer-events-none absolute -right-24 -top-20 -z-10 h-96 w-96 rounded-full blur-3xl" />
          <div aria-hidden="true" className="auth-story-orbit auth-story-orbit-one pointer-events-none absolute -right-14 top-20 -z-10 hidden h-80 w-80 rounded-full border lg:block" />
          <div aria-hidden="true" className="auth-story-orbit auth-story-orbit-two pointer-events-none absolute right-[-2rem] top-36 -z-10 hidden h-56 w-56 rounded-full border lg:block" />

          <KinoraLogo size={48} showTagline />

          <div className="relative mt-10 max-w-lg sm:mt-14 lg:mt-auto lg:mb-8">
            <span className="auth-kicker inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em]">
              <span className="auth-kicker-dot h-1.5 w-1.5 rounded-full" />
              A more thoughtful way to connect
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-[56px]">
              Make every
              <br />
              little moment
              <br />
              <span className="auth-headline-accent">mean more.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--auth-story-muted)] sm:text-base">
              Keep the people you care about close with personal messages, thoughtful reminders, and a little help making time for them.
            </p>
          </div>

          <div className="auth-preview-card mt-9 max-w-md rounded-2xl border p-4 sm:p-5 lg:mt-0">
            <div className="flex items-center gap-3">
              <span className="auth-preview-avatar flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold">M</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">A moment for Maya</p>
                <p className="mt-0.5 text-xs text-[var(--auth-story-muted)]">A note, planned with care</p>
              </div>
              <CalendarHeart size={18} className="auth-preview-calendar" aria-hidden="true" />
            </div>
            <div className="auth-preview-message mt-4 rounded-xl px-4 py-3 text-sm leading-6">
              “Just wanted to say I’m thinking of you. Hope your day is a good one.”
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--auth-story-muted)]">
              <MessageCircleHeart size={13} className="auth-preview-calendar" aria-hidden="true" />
              Staying close, one message at a time
            </div>
          </div>

          <div className="auth-story-footer mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--auth-story-muted)] lg:mt-auto lg:pt-8">
            <span className="inline-flex items-center gap-2"><UsersRound size={14} />Your personal circle</span>
            <span className="inline-flex items-center gap-2"><CalendarHeart size={14} />Thoughtful timing</span>
          </div>
        </section>

        <section className="auth-form-panel flex items-center justify-center rounded-[28px] border p-6 shadow-xl sm:p-9 lg:rounded-[32px] lg:p-12" aria-labelledby="auth-title">
          <div key={isSignUp ? "signup" : "signin"} className="auth-form-content w-full max-w-[410px]">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-accent)]">Your Kinora space</p>
              <h2 id="auth-title" className="mt-3 text-3xl font-bold tracking-[-0.045em] text-[var(--app-text)] sm:text-[34px]">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                {isSignUp
                  ? "Set up your account and start making more room for the people who matter."
                  : "Sign in to pick up where your people need you."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold text-[var(--app-text)]">Email address</label>
                <div className="auth-input-wrap relative">
                  <Mail size={17} className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="auth-input w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm text-[var(--app-text)] outline-none transition" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="auth-password" className="block text-sm font-semibold text-[var(--app-text)]">Password</label>
                  {!isSignUp && <span className="text-[11px] text-[var(--app-text-muted)]">Your account password</span>}
                </div>
                <div className="auth-input-wrap relative">
                  <LockKeyhole size={17} className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignUp ? "At least 6 characters" : "Enter your password"} className="auth-input w-full rounded-xl border py-3.5 pl-11 pr-12 text-sm text-[var(--app-text)] outline-none transition" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="auth-password-toggle absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:text-[var(--app-accent)]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="auth-confirm-field">
                  <label htmlFor="auth-confirm-password" className="mb-2 block text-sm font-semibold text-[var(--app-text)]">Confirm password</label>
                  <div className="auth-input-wrap relative">
                    <LockKeyhole size={17} className="auth-input-icon absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input id="auth-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" className="auth-input w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm text-[var(--app-text)] outline-none transition" />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div role="alert" className="auth-alert auth-error flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-5">
                  <span className="mt-0.5 font-bold" aria-hidden="true">!</span><span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div role="status" className="auth-alert auth-success flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{successMessage}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-submit group flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70">
                {loading ? <><LoaderCircle size={17} className="animate-spin" />{isSignUp ? "Creating your account…" : "Signing you in…"}</> : <>{isSignUp ? "Create account" : "Sign in to Kinora"}<ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></>}
              </button>
            </form>

            <div className="auth-divider my-7 flex items-center gap-3"><span className="h-px flex-1" /><span className="text-[10px] font-semibold uppercase tracking-[0.15em]">A little more connection</span><span className="h-px flex-1" /></div>

            <p className="text-center text-sm text-[var(--app-text-muted)]">
              {isSignUp ? "Already have an account?" : "New to Kinora?"}{" "}
              <button type="button" disabled={loading} onClick={() => switchMode(!isSignUp)} className="auth-mode-link rounded-sm font-semibold transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]">
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
            <p className="mt-7 text-center text-[11px] leading-5 text-[var(--app-text-muted)]">By continuing, you agree to use Kinora thoughtfully and keep your sign-in details private.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
