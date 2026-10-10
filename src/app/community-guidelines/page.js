import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Community Guidelines | buncho" };

const sections = [
  { id: "respect", title: "Be respectful and honest", body: [
    "Treat everyone politely. Harassment, hate, threats, discrimination or sexual content are not allowed. Give honest feedback and be open to it.",
  ]},
  { id: "profiles", title: "Keep profiles truthful", body: [
    "Experts must give true details about their college, role, company and experience. Fake or misleading profiles are removed. If you change a verified detail, it shows as \"Not verified\" until Buncho checks it again.",
  ]},
  { id: "on-platform", title: "Keep everything on Buncho", body: [
    "Don't share phone numbers, email addresses, links, social handles or payment details in requests or replies, and don't ask anyone to continue elsewhere. Buncho reads every reply before it reaches the student, and replies that move the conversation off Buncho are not sent.",
    "This protects you: payments, refunds and support only work for what happens on Buncho.",
  ]},
  { id: "quality", title: "Give real help", body: [
    "Experts should answer the question that was asked, in their own words. Don't copy other people's work, paste generic text, or share confidential information from an employer. Students should write clear requests and not ask for anything unlawful, such as help to cheat or to fake credentials.",
  ]},
  { id: "misuse", title: "Don't misuse the platform", body: [
    ["No spam, scams or attempts to collect other people's data.", "No fake reviews, fake accounts or attempts to get around payments.", "No attempts to break, probe or overload the site."],
  ]},
  { id: "enforcement", title: "What happens if rules are broken", body: [
    "Depending on how serious it is, we may reject a reply, remove content, mark a profile as not verified, suspend an account, or refuse refunds linked to the misuse. You can write to us through the Contact page if you think we got it wrong.",
  ]},
  { id: "report", title: "Report a problem", body: [
    "If someone breaks these guidelines, tell us through the Contact page with as much detail as you can.",
  ]},
];

export default function Guidelines() {
  return <LegalPage title="Community Guidelines" intro="A few simple rules that keep Buncho useful and safe for students and experts." sections={sections} />;
}