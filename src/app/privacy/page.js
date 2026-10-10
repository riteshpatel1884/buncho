import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Privacy Policy | buncho" };

const sections = [
  { id: "who", title: "Who we are", body: [
    `${COMPANY.legalName} ("Buncho") runs this website and decides how your personal data is used. This policy explains what we collect, why, who we share it with, and the choices you have. It is written to follow Indian law, including the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.`,
  ]},
  { id: "collect", title: "What we collect", body: [
    ["Account details: name, email address and profile picture, received from our sign-in provider when you sign up or sign in.", "Student profile: college, branch, year, target role, skills, career goal and what you are stuck on.", "Expert profile: name, headline, role, company, college, branch, graduation year, experience, skills, bio, LinkedIn and GitHub links, services, prices and availability.", "Requests and replies: the question you write when booking, the expert's replies, follow-up questions, and the status of each request.", "Payment records: the amount, status and payment ID of a payment. Card, UPI and bank details are collected by our payment partner, not by Buncho.", "Technical data: basic usage and device information, and cookies or similar storage described below."],
  ]},
  { id: "use", title: "How we use your data", body: [
    ["To create your account and run the service: showing profiles, handling requests, payments, refunds and emails.", "To check expert details and to review expert replies before they reach students.", "To keep Buncho safe: preventing fraud, abuse and sharing of contact details outside the platform.", "To send you service emails, such as new requests, acceptances, replies and refunds.", "To improve Buncho and meet our legal obligations."],
    "We don't sell your personal data.",
  ]},
  { id: "share", title: "Who we share it with", body: [
    ["The other person in a request. An expert sees the student's name, college, year, target role and the question they wrote. A student sees the expert's public profile and the replies sent to them.", "Buncho staff, who read requests, replies and profile details to review quality, safety and disputes. A copy of replies sent to students is also kept for our records.", "Service providers who help us run Buncho: sign-in and account services, payment processing (Dodo Payments), email delivery, and hosting and database services. They may only use your data to provide their service to us.", "Authorities, when required by law or to protect rights and safety."],
    "Expert profiles are public. Anything you put on your public profile can be seen by anyone, including search engines.",
  ]},
  { id: "cookies", title: "Cookies and local storage", body: [
    "We and our sign-in provider use cookies that are needed to keep you signed in and secure. We also store your light or dark theme choice in your browser. We don't use advertising cookies.",
    "You can clear or block cookies in your browser settings, but parts of Buncho may stop working.",
  ]},
  { id: "payments", title: "Payments", body: [
    "Payments are handled by Dodo Payments under its own terms and privacy policy. We receive confirmation that a payment succeeded or was refunded, along with its amount and ID.",
  ]},
  { id: "retention", title: "How long we keep data", body: [
    "We keep your data while your account is active and for as long as needed to run the service, resolve disputes, prevent fraud and meet legal, tax and accounting duties. When data is no longer needed we delete it or make it anonymous.",
  ]},
  { id: "security", title: "Security", body: [
    "We use reasonable technical and organisational measures to protect your data. No system is perfectly secure, so please use a strong sign-in method and tell us at once if you think your account was accessed by someone else.",
  ]},
  { id: "rights", title: "Your rights", body: [
    "You can ask us to:",
    ["Show you the personal data we hold about you.", "Correct or update inaccurate data.", "Delete your data and account, subject to records we must keep by law.", "Withdraw consent where we rely on it, and nominate someone to exercise your rights if you can't."],
    "Many details can be changed directly from your profile. For anything else, contact us using the details below.",
  ]},
  { id: "children", title: "Children", body: [
    "Buncho is meant for people aged 18 and over. If you are younger, a parent or guardian must agree to this policy and supervise your use. If you believe a child has given us data without this consent, contact us and we will delete it.",
  ]},
  { id: "changes", title: "Changes to this policy", body: [
    "We may update this policy. We will change the date above and, for important changes, tell you on the site or by email.",
  ]},
  { id: "grievance", title: "Contact and grievances", body: [
    `Grievance Officer: ${COMPANY.grievanceOfficer}. Email: ${COMPANY.supportEmail}. Address: ${COMPANY.address}.`,
    "We acknowledge complaints within 48 hours and aim to resolve them within one month.",
  ]},
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" intro="Your trust matters. This is what we collect, why we collect it and who sees it." sections={sections} />;
}