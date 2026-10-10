import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Contact and Grievances | buncho" };

const sections = [
  { id: "support", title: "Support", body: [
    `Email us at bunchohq@gmail.com for help with a request, a payment, a refund or your account.`,
    "To help us respond quickly, include:",
    ["The email address on your Buncho account.", "The expert and service name, and the date of the request.", "A short description of what went wrong, and screenshots if you have them."],
    "We acknowledge every message within 48 hours.",
  ]}
  
];

export default function Contact() {
  return <LegalPage title="Contact and Grievances" intro="We're here to help. Reach us for support, refunds, privacy requests or complaints." sections={sections} />;
}