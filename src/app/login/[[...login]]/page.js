import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-canvas px-4 py-10">
      <SignIn />
    </div>
  );
}