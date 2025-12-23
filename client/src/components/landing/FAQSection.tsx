import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "You get full access to all Pro features for 14 days, no credit card required. After the trial, you can choose to upgrade or continue with our free plan."
  },
  {
    question: "Are the digital signatures legally binding?",
    answer: "Yes, our digital signatures are fully compliant with eSignature laws including ESIGN Act and eIDAS regulation. They're legally binding and court-admissible."
  },
  {
    question: "Can I customize the proposal templates?",
    answer: "Absolutely! You can customize templates with your branding, colors, fonts, and content. Pro users get access to advanced customization options and can create unlimited custom templates."
  },
  {
    question: "How does the payment tracking work?",
    answer: "ProposalFlow integrates with popular payment processors to automatically track payment status. You'll get real-time updates and can send automated reminders for overdue payments."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use bank-level encryption (AES-256) and are SOC 2 Type II compliant. Your data is stored securely and we never share it with third parties."
  },
  {
    question: "Can I import my existing proposals?",
    answer: "Yes, we provide tools to import proposals from popular formats including PDF, Word, and other proposal software. Our team can also help with bulk imports."
  },
  {
    question: "Do you offer integrations?",
    answer: "Yes, we integrate with popular tools like QuickBooks, Stripe, PayPal, Google Drive, and more. Enterprise plans include API access for custom integrations."
  },
  {
    question: "What kind of support do you provide?",
    answer: "Free users get email support, Pro users get priority support with faster response times, and Enterprise users get dedicated account management and phone support."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a 
            href="mailto:support@proposalflow.com" 
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
};