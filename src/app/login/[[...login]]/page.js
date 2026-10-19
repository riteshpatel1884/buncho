import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="grid place-items-center px-4 py-14">
      <SignIn />
    </div>
  );
}
