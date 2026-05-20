import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND_BLUE } from "@/lib/brand-colors";
import type { FaqItemCopy } from "@/lib/static-pages-i18n";

const FAQ_INFO_EMAIL = "info@ketujemi.com";
const FAQ_SUPPORT_EMAIL = "support@ketujemi.com";

function FaqAnswer({ item }: { item: FaqItemCopy }) {
  if (item.aEmail) {
    return (
      <p className="text-gray-600 leading-relaxed">
        {item.aEmail.before}
        <a href={`mailto:${FAQ_INFO_EMAIL}`} className="font-semibold hover:underline" style={{ color: BRAND_BLUE }}>
          {FAQ_INFO_EMAIL}
        </a>
        {item.aEmail.between}
        <a href={`mailto:${FAQ_SUPPORT_EMAIL}`} className="font-semibold hover:underline" style={{ color: BRAND_BLUE }}>
          {FAQ_SUPPORT_EMAIL}
        </a>
        {item.aEmail.after}
      </p>
    );
  }
  return <p className="text-gray-600 leading-relaxed">{item.a}</p>;
}

export function FaqAccordion({ items }: { items: FaqItemCopy[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={`faq-${i}`} className="border-gray-200">
          <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
            {item.q}
          </AccordionTrigger>
          <AccordionContent>
            <FaqAnswer item={item} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
