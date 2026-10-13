// Plain helpers shared by the server (pages, push) and the client (bell). No imports, no side effects.

// What the notification says.
export function notificationText(type, name) {
  const who = name || "Someone";
  switch (type) {
    case "FOLLOW": return `${who} started following you`;
    case "LIKE": return `${who} liked your post`;
    case "COMMENT": return `${who} commented on your post`;
    case "REPLY": return `${who} replied to your comment`;
    case "MENTION": return `${who} mentioned you`;
    case "MESSAGE": return `${who} sent you a message`;
    default: return "New activity on Buncho";
  }
}

// Where tapping it goes.
export function notificationHref({ type, postId, actorSlug }) {
  if (postId) return `/feed/${postId}`;
  if (type === "FOLLOW") return actorSlug ? `/experts/${actorSlug}` : "/feed";
  return "/notifications";
}