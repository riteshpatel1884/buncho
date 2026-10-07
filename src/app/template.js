// A template re-mounts on every navigation, so each page fades in.
export default function Template({ children }) {
  return <div className="page-in">{children}</div>;
}
