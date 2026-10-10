export function findContactInfo(text) {
  const t = String(text || "");
  const flags = [];
  if (/[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\])\s*[a-z0-9-]+\s*(?:\.|\(dot\)|\[dot\])\s*[a-z]{2,}/i.test(t)) flags.push("email");
  if (/(?:\+?91[\s-]?)?[6-9](?:[\s.-]?\d){9}/.test(t)) flags.push("phone number");
  if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|in|io|me|co|net|org|app|dev|link|ly)\b/i.test(t)) flags.push("link");
  if (/(?:^|\s)@[a-z0-9_.]{3,}/i.test(t)) flags.push("social handle");
  if (/\b(?:whats\s?app|telegram|signal|instagram|insta|snapchat|discord|skype|phonepe|paytm|gpay|upi)\b|\b(?:dm|call|text|ping)\s+me\b/i.test(t)) flags.push("off-platform wording");
  return flags;
}