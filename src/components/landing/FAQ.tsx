import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What control panel do you provide?",
    answer:
      "All hosting plans include full access to CyberPanel, a modern and user-friendly control panel. You can manage websites, emails, databases, SSL certificates, and more from a single dashboard at vintechdev.store:8090.",
  },
  {
    question: "How do I access my hosting account?",
    answer:
      "After signing up, you'll receive login credentials for our client area. From there, you can manage your services, view invoices, open support tickets, and access CyberPanel to manage your websites.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods through our billing system at billing.vintechdev.store. You can view all available options during checkout.",
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer:
      "Yes! We offer a 30-day money-back guarantee on all hosting plans. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "How do I get support?",
    answer:
      "You can open a support ticket through your client area. Our team monitors tickets and will respond as quickly as possible to help resolve your issues.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Absolutely! You can upgrade your hosting plan at any time through the client area. The price difference will be prorated for the remaining billing period.",
  },
  {
    question: "Do you provide free SSL certificates?",
    answer:
      "Yes, all plans include free Let's Encrypt SSL certificates that auto-renew. You can install them easily through CyberPanel with just a few clicks.",
  },
  {
    question: "What is your uptime guarantee?",
    answer:
      "We maintain a 99.9% uptime guarantee. Our infrastructure is hosted on Oracle Cloud, providing enterprise-grade reliability and performance.",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
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
