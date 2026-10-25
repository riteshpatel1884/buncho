// Private area: never index, never follow. (Also disallowed in robots.js.)
export const metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminUsersLayout({ children }) {
  return children;
}