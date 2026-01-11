import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I get started with Vintech Hosting?",
    answer:
      "Getting started is easy! Simply choose a plan that fits your needs, complete the quick signup process, and your hosting account will be ready in minutes. Our one-click installers make it simple to launch WordPress, Joomla, or any other popular CMS.",
  },
  {
    question: "What's included in each hosting plan?",
    answer:
      "All plans include free SSL certificates, SSD storage, unlimited bandwidth, and access to our control panel. Higher-tier plans add features like unlimited websites, priority support, free domains, and advanced security tools. Check our pricing section for detailed comparisons.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Absolutely! You can upgrade your plan at any time from your dashboard. The upgrade is instant, and we'll prorate the remaining time on your current plan. Your data and settings will be preserved during the upgrade.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes! We offer a 30-day money-back guarantee on all hosting plans. If you're not completely satisfied, contact our support team within 30 days of purchase for a full refund. No questions asked.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All transactions are secured with industry-standard encryption.",
  },
  {
    question: "How does your 99.9% uptime guarantee work?",
    answer:
      "Our infrastructure is built for reliability with redundant systems and 24/7 monitoring. If we fail to meet our 99.9% uptime guarantee in any calendar month, you'll receive account credit proportional to the downtime experienced.",
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
