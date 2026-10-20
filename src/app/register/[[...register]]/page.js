import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-canvas px-4 py-10">
      <SignUp />
    </div>
  );
}