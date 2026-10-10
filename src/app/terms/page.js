import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Terms and Conditions | buncho" };

const sections = [
  { id: "about", title: "About Buncho and these terms", body: [
    `Buncho is an online platform operated by ${COMPANY.legalName} ("Buncho", "we", "us"), with its registered office at ${COMPANY.address}. It connects students with experts (seniors and working professionals) who answer questions in writing, such as resume reviews, mock interview feedback, career guidance and project reviews.`,
    "By creating an account or using Buncho you agree to these Terms, our Privacy Policy, our Refund and Cancellation Policy and our Community Guidelines. If you don't agree, please don't use Buncho.",
  ]},
  { id: "eligibility", title: "Who can use Buncho", body: [
    "Buncho is meant for people aged 18 or older. If you are younger, a parent or guardian must agree to these terms and supervise your use of Buncho.",
    "You must give accurate information and keep your account secure. You are responsible for everything done through your account.",
  ]},
  { id: "marketplace", title: "How Buncho works", body: [
    "Buncho is a marketplace. Experts are independent individuals, not employees or agents of Buncho. They set their own services and prices. Buncho provides the platform, the booking and payment flow, and a review of expert profiles and replies.",
    "A request works like this:",
    ["A student picks a service, writes what they need help with, and pays (if the service is paid).", "The expert accepts or declines.", "If accepted, the expert writes a reply. Buncho reads every reply before it is sent to the student.", "The student confirms the reply solved their question, or asks for a free follow-up. Each request includes up to 2 free follow-up answers."],
  ]},
  { id: "students", title: "Students", body: [
    "Be specific about what you need. The expert answers what you write in your request.",
    "Advice from experts is their opinion based on their experience. Buncho does not promise any job, interview, shortlist, grade or other outcome.",
  ]},
  { id: "experts", title: "Experts", body: [
    "You must give true information about your education, employment and experience, and keep it up to date. Buncho may check your details, including through the links you provide, before your profile goes live and again after you change important details.",
    "Details you change after they were checked are shown as \"Not verified\" until we check them again. A badge means Buncho checked that detail at a point in time. It is not a guarantee of the expert's skill or results.",
    "You are responsible for the quality of your replies, for any taxes that apply to your earnings, and for having the right to share anything you send. You must not copy other people's work or share confidential information from your employer.",
  ]},
  { id: "payments", title: "Prices and payments", body: [
    "Prices are in Indian rupees (INR) and set by experts. Payments are processed securely by our payment partner, Dodo Payments. Buncho does not see or store your card, UPI or bank details.",
    "A paid request is held for you for 20 minutes while your payment goes through. If payment is not completed, the request is not sent to the expert.",
    "Refunds and cancellations are covered in the Refund and Cancellation Policy, which is part of these Terms.",
  ]},
  { id: "blue-tick", title: "Blue tick subscription for experts", body: [
    "Experts can pay for a blue tick, shown next to their name on their profile and in search. The price shown at checkout (currently ₹99 per month) renews each month until you cancel.",
    "You can cancel renewal from your dashboard at any time. The tick stays until the end of the period you already paid for. The blue tick is a paid feature and does not mean Buncho endorses the expert beyond the checks described above.",
  ]},
  { id: "keep-on-buncho", title: "Keep everything on Buncho", body: [
    "Please don't share phone numbers, email addresses, links or social handles in requests or replies, and don't try to move the conversation or payment off Buncho. Buncho reads replies before they are sent and may reject replies that break this rule. Repeated attempts can lead to suspension. See the Community Guidelines.",
  ]},
  { id: "content", title: "Your content and our content", body: [
    "You own what you write. You give Buncho a limited licence to store, display and deliver it to the other person in a request, to review it for safety and quality, and to operate and improve the service.",
    "The Buncho name, logo, design and software belong to us. Don't copy or reuse them without our written permission.",
  ]},
  { id: "disclaimer", title: "Disclaimers", body: [
    "Buncho is provided \"as is\" and \"as available\". We work to keep it running and accurate, but we don't promise it will always be available or error-free. We don't guarantee the accuracy, completeness or suitability of any expert's advice.",
  ]},
  { id: "liability", title: "Limit of liability", body: [
    "To the extent allowed by law, Buncho is not liable for indirect or consequential losses, or for decisions you make based on an expert's advice. Our total liability to you for any claim related to a request is limited to the amount you paid for that request.",
    "Nothing in these Terms limits liability that cannot be limited under applicable law, including your rights as a consumer.",
  ]},
  { id: "suspension", title: "Suspension and ending your account", body: [
    "We may suspend or remove accounts or profiles that break these Terms, give false information, abuse other users, or put the platform at risk. You can stop using Buncho at any time. To delete your account and data, contact us as described in the Privacy Policy.",
  ]},
  { id: "changes", title: "Changes to these terms", body: [
    "We may update these Terms. When we make important changes we will update the date above and, where appropriate, tell you by email or on the site. Continuing to use Buncho after a change means you accept it.",
  ]},
  { id: "law", title: "Governing law and disputes", body: [
    `These Terms are governed by the laws of India. If you have a complaint, please write to us first through the Contact page so we can try to resolve it. If we can't, the courts at ${COMPANY.jurisdictionCity}, India will have jurisdiction, without affecting any rights you have under consumer protection law.`,
  ]},
];

export default function Terms() {
  return <LegalPage title="Terms and Conditions" intro="Please read these terms carefully. They explain the rules for using Buncho as a student or an expert." sections={sections} />;
}