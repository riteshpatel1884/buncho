import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="grid place-items-center px-4 py-14">
      <SignUp />
    </div>
  );
}
