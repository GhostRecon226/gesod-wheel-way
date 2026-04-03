import { ChevronDown } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the bid-on-behalf service work?",
    a: "You provide us with the vehicle details (lot number, auction source, and your maximum bid). Our team registers, monitors, and places bids on your behalf. If we win, we notify you immediately and proceed with payment and logistics.",
  },
  {
    q: "What does RORO shipping mean?",
    a: "RORO stands for Roll-On/Roll-Off. The vehicle is driven onto the vessel at the US port and driven off at the Nigerian port. It's the most cost-effective and common method for shipping vehicles internationally.",
  },
  {
    q: "How much is customs duty on imported vehicles in Nigeria?",
    a: "Customs duty varies by vehicle type and age. Typically, the total landing cost (duty, surcharge, VAT, CISS, etc.) ranges between 30–70% of the vehicle's assessed value. We provide detailed duty estimates before shipment.",
  },
  {
    q: "What documents are required for vehicle importation?",
    a: "Key documents include: the original vehicle title, bill of lading, commercial invoice, Form M, Pre-Arrival Assessment Report (PAAR), insurance certificate, and a valid means of identification.",
  },
  {
    q: "How long does the entire import process take?",
    a: "From auction win to delivery in Nigeria, the process typically takes 6–10 weeks depending on the shipping route, vessel availability, and customs clearance timeline.",
  },
  {
    q: "What are the payment stages?",
    a: "Payments are structured in stages: (1) deposit to bid, (2) vehicle balance after winning, (3) shipping and inland towing fees, (4) customs duty and clearing charges. Each stage is clearly communicated before payment is required.",
  },
  {
    q: "What is Form M and why is it required?",
    a: "Form M is a mandatory document from the Central Bank of Nigeria for all imports valued above a certain threshold. It must be obtained through an authorized dealer bank before goods arrive at the port.",
  },
  {
    q: "Is marine insurance included?",
    a: "Marine insurance is optional but strongly recommended. It covers damage or total loss during ocean transit. We can arrange competitive insurance rates through our partner underwriters.",
  },
];

const FAQ = () => (
  <PublicLayout>
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-silver">Frequently Asked Questions</h1>
      <p className="mt-2 text-muted-foreground">
        Everything you need to know about importing vehicles with GESOD RIDES.
      </p>

      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="rounded-xl border border-border bg-card px-5"
          >
            <AccordionTrigger className="text-left text-silver hover:no-underline [&>svg]:text-copper">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </PublicLayout>
);

export default FAQ;
