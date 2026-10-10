"use client";
import { UserButton } from "@clerk/nextjs";
import { useTheme, CLERK_VARS } from "@/lib/useTheme";

// showName puts the account name next to the avatar (used inside the mobile menu).
export default function UserMenu({ showName = false }) {
  const theme = useTheme();
  return <UserButton showName={showName} appearance={{ variables: CLERK_VARS[theme] }} />;
}