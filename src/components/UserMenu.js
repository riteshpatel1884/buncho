"use client";
import { UserButton } from "@clerk/nextjs";
import { useTheme, CLERK_VARS } from "@/lib/useTheme";

export default function UserMenu() {
  const theme = useTheme();
  return <UserButton appearance={{ variables: CLERK_VARS[theme] }} />;
}
