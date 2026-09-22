import type { Project } from "../types";

/**
 * Projects displayed on the /projects/ page.
 *
 * To add a project:
 *   1. Drop its screenshot in `public/assets/images/projects/`
 *      (a 16:9 image, ~1200x675, keeps every card aligned).
 *   2. Add an entry below. `website` and `github` are optional:
 *      leave them out and the matching button is simply not rendered.
 *   3. Set `featured: true` to pin a project at the top of the list.
 */
export const PROJECTS: Project[] = [
  {
    title: "Grimm App",
    description:
      "A self-custodial Bitcoin wallet for everyday payments. Send and receive over the Lightning Network in seconds, keep your own keys, and restore from an encrypted local backup. Built on the Breez SDK and shipped on both the App Store and Google Play.",
    image: "/assets/images/projects/grimm-app.png",
    imageAlt: "Grimm App landing page showing the mobile Bitcoin wallet",
    website: "https://usegrimm.app",
    github: "https://github.com/grimm-labs/grimm-mobile-app",
    tags: [
      "React Native",
      "TypeScript",
      "Bitcoin",
      "Lightning Network",
      "Breez SDK",
      "BDK",
    ],
    featured: true,
  },
  {
    title: "Grimm Point",
    description:
      "Bill payments for Cameroon settled in Bitcoin Lightning: airtime, mobile data, ENEO electricity and TV subscriptions, paid from any Lightning wallet in a few seconds. Non-custodial by design — the platform never holds user funds.",
    image: "/assets/images/projects/grimm-point.png",
    imageAlt: "Grimm Point landing page: pay bills with Bitcoin Lightning",
    website: "https://grimmpoint.app",
    tags: [
      "Next.js",
      "TypeScript",
      "Bitcoin",
      "Lightning Network",
      "MTN & Orange",
    ],
  },
  {
    title: "Kivoo",
    description:
      "An online store builder for African creators. Sell digital files, courses, services or physical products, get paid in FCFA through MTN and Orange Mobile Money, and let buyers receive their download by email as soon as the payment clears. No subscription — a 10% commission per sale.",
    image: "/assets/images/projects/kivoo.png",
    imageAlt: "Kivoo landing page: Create. Sell. Grow.",
    website: "https://kivoo.africa",
    tags: [
      "Next.js",
      "TypeScript",
      "Mobile Money",
      "E-commerce",
      "Analytics",
    ],
  },
  {
    title: "Stablecoin Payment Gateway",
    description:
      "A Rust microservice for accepting USDT deposits. It derives a fresh HD address per payment, watches Tron, Ethereum and Solana for the incoming transfer, and delivers pending / paid / expired webhooks with retries. Comes with a React admin dashboard for payments, API keys, webhook monitoring and staff management.",
    image: "/assets/images/projects/stablecoin-payment-gateway.svg",
    imageAlt:
      "Architecture diagram: a merchant API calls the Rust gateway, which watches Tron, Ethereum and Solana and emits webhooks",
    github: "https://github.com/nejos97/stablecoin-payment-gateway",
    tags: ["Rust", "PostgreSQL", "Redis", "React", "Docker", "Web3"],
  },
];

/** Featured projects first, then the others, each group keeping its declaration order. */
export const getSortedProjects = (projects: Project[] = PROJECTS): Project[] =>
  [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  );

export default PROJECTS;
