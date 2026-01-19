import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I manage my websites?",
    answer:
      "All hosting plans include access to our easy-to-use web control panel. You can manage websites, emails, databases, SSL certificates, and more from a single intuitive dashboard.",
  },
  {
    question: "How do I access my hosting account?",
    answer:
      "After signing up, you'll receive login credentials for your client dashboard. From there, you can manage your services, view invoices, open support tickets, and access your hosting control panel.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and various other payment methods. You can view all available options during checkout.",
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer:
      "Yes! We offer a 30-day money-back guarantee on all hosting plans. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "How do I get support?",
    answer:
      "You can open a support ticket through your client dashboard. Our expert team monitors tickets around the clock and will respond promptly to help resolve your issues.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Absolutely! You can upgrade your hosting plan at any time through the client dashboard. The price difference will be prorated for the remaining billing period.",
  },
  {
    question: "Do you provide free SSL certificates?",
    answer:
      "Yes, all plans include free SSL certificates that auto-renew. You can install them easily through your control panel with just a few clicks.",
  },
  {
    question: "What is your uptime guarantee?",
    answer:
      "We maintain a 99.9% uptime guarantee. Our infrastructure is hosted on enterprise-grade cloud servers, providing reliable performance and stability.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-secondary/50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our hosting services. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 data-[state=open]:border-primary/30 transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
