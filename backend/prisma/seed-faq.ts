import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const faqEntries = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely through Stripe.",
    category: "PAYMENT",
    tags: ["payment", "credit card", "paypal", "stripe"],
    sortOrder: 1,
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 3-5 business days within the US. Express shipping (1-2 business days) and international shipping options are also available. Delivery times may vary based on your location.",
    category: "SHIPPING",
    tags: ["shipping", "delivery", "timing"],
    sortOrder: 2,
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be in original condition with all tags attached. Return shipping is free for defective items. Please contact our customer service team to initiate a return.",
    category: "RETURNS",
    tags: ["returns", "refunds", "policy"],
    sortOrder: 3,
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. Import duties and taxes may apply and are the responsibility of the customer.",
    category: "SHIPPING",
    tags: ["international", "shipping", "duties"],
    sortOrder: 4,
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order through your account dashboard or by contacting our customer service team.",
    category: "SHIPPING",
    tags: ["tracking", "order status", "shipping"],
    sortOrder: 5,
  },
  {
    question: "Are your products authentic?",
    answer:
      "Yes, all our products are 100% authentic and sourced directly from authorized manufacturers and distributors. We never sell counterfeit or replica items.",
    category: "PRODUCT_INFORMATION",
    tags: ["authentic", "genuine", "quality"],
    sortOrder: 6,
  },
  {
    question: "Do you offer discounts for bulk orders?",
    answer:
      "Yes, we offer volume discounts for bulk orders. Please contact our sales team for custom pricing on orders of 10+ items. We also have regular sales and promotional offers.",
    category: "GENERAL",
    tags: ["bulk", "discounts", "wholesale"],
    sortOrder: 7,
  },
  {
    question: "How do I contact customer service?",
    answer:
      "You can reach our customer service team through our live chat widget, email at support@example.com, or by phone at 1-800-EXAMPLE. We're available Monday-Friday, 9 AM-6 PM EST.",
    category: "GENERAL",
    tags: ["contact", "support", "customer service"],
    sortOrder: 8,
  },
  {
    question: "What if my item arrives damaged?",
    answer:
      "If your item arrives damaged, please take photos and contact us within 48 hours of delivery. We'll arrange for a replacement or refund and cover return shipping costs.",
    category: "RETURNS",
    tags: ["damaged", "defective", "replacement"],
    sortOrder: 9,
  },
  {
    question: "Do you have a loyalty program?",
    answer:
      "Yes! Join our rewards program to earn points on every purchase. Points can be redeemed for discounts on future orders. You'll also get early access to sales and exclusive offers.",
    category: "GENERAL",
    tags: ["loyalty", "rewards", "points"],
    sortOrder: 10,
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled within 1 hour of placement if they haven't been processed for shipping. After that, you'll need to wait for delivery and use our return process.",
    category: "GENERAL",
    tags: ["cancellation", "order modification"],
    sortOrder: 11,
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes, gift wrapping is available for an additional $5.99 per item. You can select this option during checkout. We also offer gift cards that can be sent directly to recipients.",
    category: "GENERAL",
    tags: ["gift wrapping", "gift cards", "special occasions"],
    sortOrder: 12,
  },
];

async function main() {
  console.log("🌱 Seeding FAQ entries...");

  for (const faq of faqEntries) {
    await prisma.fAQEntry.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        tags: faq.tags,
        sortOrder: faq.sortOrder,
        isActive: true,
      },
    });
  }

  console.log("✅ FAQ entries seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding FAQ entries:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
