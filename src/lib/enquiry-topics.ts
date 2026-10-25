// Shared by the Support page form (client) and /api/enquiries (server), so
// keep this file free of server-only imports.
export const ENQUIRY_TOPICS = [
  { id: 'STUDY_PLAN', label: 'Free study plan', hint: 'Which certification fits my goals, and how should I prepare?' },
  { id: 'VOUCHER_QUOTE', label: 'Exam Voucher quote', hint: 'Price and availability of an official exam voucher.' },
  { id: 'TEAM', label: 'Teams & corporate', hint: 'Practice Exams or vouchers for several staff, with one invoice.' },
  { id: 'ORDER_HELP', label: 'Order or account help', hint: 'Payment, access, invoice or voucher delivery.' },
  { id: 'CONTENT', label: 'Question feedback', hint: 'Report an issue with a question or explanation.' },
  { id: 'OTHER', label: 'Something else', hint: 'Anything we have not listed.' }
] as const;

export type EnquiryTopicId = (typeof ENQUIRY_TOPICS)[number]['id'];

export const ENQUIRY_TOPIC_IDS = ENQUIRY_TOPICS.map((t) => t.id) as [EnquiryTopicId, ...EnquiryTopicId[]];

export function enquiryTopicLabel(id: string): string {
  return ENQUIRY_TOPICS.find((t) => t.id === id)?.label ?? id;
}

export const WHATSAPP_NUMBER = '6588666375';
export const WHATSAPP_DISPLAY = '+65 8866 6375';

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
