// Static legal content page, linked from the Navbar right next to
// "View Current Auctions". Content is the current draft Terms and
// Conditions (last updated placeholder — fill in before publishing, see
// the note banner below). Not gated by BuyerBrowsingGuard — every role,
// including sellers, can read this page.

import PageHeader from "../ui/PageHeader";
// import { useEffect } from "react";

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      `By creating an account or using Auctra ("the Platform," "we," "us"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Platform.`,
    ],
  },
  {
    heading: "2. Definitions",
    body: [
      {
        type: "list",
        items: [
          <><strong>"Buyer"</strong> — a user who bids on and purchases items through the Platform.</>,
          <><strong>"Seller"</strong> — a user who lists items for auction on the Platform.</>,
          <><strong>"Auction"</strong> — a time-bound listing during which Buyers may place competitive bids.</>,
          <><strong>"Collateral"</strong> — a refundable deposit a Buyer must lock before bidding on a specific live Auction.</>,
          <><strong>"KYC"</strong> — the identity verification process required of all Buyers and Sellers.</>,
        ],
      },
    ],
  },
  {
    heading: "3. Eligibility and Account Registration",
    body: [
      "3.1. You must be at least [18] years old to create an account.",
      "3.2. When registering, you must provide accurate information, including a valid email address. Auctra verifies new accounts via a one-time code sent to the email provided.",
      "3.3. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "3.4. Auctra reserves the right to refuse, suspend, or terminate any account at its discretion, including for violation of these Terms.",
    ],
  },
  {
    heading: "4. KYC Verification",
    body: [
      "4.1. Before participating as a Buyer or Seller, you must submit identity verification documents (including a government-issued ID and proof of address) for review.",
      `4.2. Accounts remain in "pending" status until an administrator approves the submission. Auctra may reject a submission, in which case you may resubmit corrected documents.`,
      "4.3. You may not log in or transact on the Platform until your KYC submission is approved.",
      "4.4. Providing false, forged, or misleading documents is grounds for immediate account termination and may be reported to relevant authorities.",
    ],
  },
  {
    heading: "5. Auction Listings (Sellers)",
    body: [
      "5.1. Sellers may list an item by providing a title, description, category, condition, starting price, images, and auction duration.",
      `5.2. Listings may only be edited or removed while the auction has the status "scheduled" (i.e., before bidding opens). Once an auction is live, its price, category, and core details are final.`,
      "5.3. Sellers are responsible for the accuracy of their listings, including the authenticity and condition of the item described.",
      "5.4. By listing an item, the Seller agrees to sell it to the winning Buyer at the winning bid price, subject to these Terms.",
    ],
  },
  {
    heading: "6. Bidding Process (Buyers)",
    body: [
      "6.1. Buyers may only bid on a live auction after locking the required Collateral for that specific auction (see Section 7).",
      "6.2. Each bid must exceed the current highest bid by at least the platform's minimum increment.",
      "6.3. All bids are binding. A Buyer may not retract a bid once placed.",
      "6.4. The auction closes at its scheduled end time. The Buyer with the highest bid at closing is the winning bidder.",
    ],
  },
  {
    heading: "7. Collateral Deposits",
    body: [
      "7.1. Before placing a bid on a given auction, a Buyer must deposit a refundable Collateral amount, calculated as a percentage of the item's starting price, via a supported payment method (eSewa, Khalti, or card).",
      "7.2. Collateral is locked to the specific auction it was deposited for and does not carry over to other auctions.",
      "7.3. If the Buyer does not win the auction, the Collateral is released back to the Buyer.",
      "7.4. If the Buyer wins the auction but fails to complete payment within the required deadline, the Collateral may be forfeited (see Section 9).",
    ],
  },
  {
    heading: "8. Winning an Auction and Payment",
    body: [
      "8.1. The winning Buyer will be notified and must complete payment for the full winning bid amount within [X days] of the auction closing.",
      "8.2. Payment must be made via a supported payment method.",
      "8.3. Failure to pay within the deadline is treated as a breach of these Terms.",
    ],
  },
  {
    heading: "9. Non-Payment and Re-Offer to Next Bidder",
    body: [
      `9.1. If the winning Buyer fails to pay within the deadline, Auctra may forfeit that Buyer's Collateral and offer the item to the next-highest bidder ("cascade"), who then has their own payment deadline to complete the purchase.`,
      "9.2. This process may repeat down the bid history until the item is sold or no eligible bidders remain.",
      "9.3. Repeated non-payment may result in account suspension or termination.",
    ],
  },
  {
    heading: "10. Fees",
    body: [
      "10.1. [Auctra's fee structure — e.g., buyer's premium, seller commission, or listing fees — to be defined. Insert specifics here before publishing.]",
    ],
  },
  {
    heading: "11. Notifications",
    body: [
      "11.1. Auctra will notify Sellers when their auction receives its first bid, notify Buyers when they are outbid, and notify participants when an auction is ending soon.",
      "11.2. Notifications are provided for convenience and do not replace a user's own responsibility to track auctions they're participating in.",
    ],
  },
  {
    heading: "12. Prohibited Conduct",
    body: [
      "You agree not to:",
      {
        type: "list",
        items: [
          "Submit false or misleading KYC documents or listing information",
          "Place bids you do not intend to honor",
          "Use another person's account or share your credentials",
          "Attempt to manipulate bidding (e.g., shill bidding, collusion with other bidders)",
          "Interfere with the Platform's operation, including through automated bots or scraping",
          "Use the Platform for any unlawful purpose",
        ],
      },
    ],
  },
  {
    heading: "13. Account Suspension and Termination",
    body: [
      "Auctra may suspend or terminate any account, cancel any listing, or void any bid at its discretion where it reasonably believes these Terms have been violated, without prior notice in cases of suspected fraud or abuse.",
    ],
  },
  {
    heading: "14. Intellectual Property",
    body: [
      "All content on the Platform (excluding user-submitted listing content) — including the Auctra name, logo, and design — is the property of Auctra and may not be used without permission. Sellers retain ownership of images and descriptions they upload but grant Auctra a license to display them on the Platform.",
    ],
  },
  {
    heading: "15. Disclaimers",
    body: [
      "15.1. Auctra is a marketplace facilitating auctions between independent Buyers and Sellers. We do not own, inspect, or guarantee the condition, authenticity, or legality of listed items unless explicitly stated.",
      `15.2. The Platform is provided "as is" without warranties of any kind, express or implied.`,
    ],
  },
  {
    heading: "16. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, Auctra shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, disputes between Buyers and Sellers, or the condition/authenticity of items sold.",
    ],
  },
  {
    heading: "17. Privacy",
    body: [
      "Your use of the Platform is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal and KYC information. [Link to Privacy Policy.]",
    ],
  },
  {
    heading: "18. Dispute Resolution",
    body: [
      "18.1. Disputes between Buyers and Sellers should first be raised through [Auctra's support channel].",
      "18.2. [Insert arbitration/mediation clause and jurisdiction if applicable.]",
    ],
  },
  {
    heading: "19. Governing Law",
    body: [
      "These Terms are governed by the laws of [Nepal / insert applicable jurisdiction], without regard to conflict-of-law principles.",
    ],
  },
  {
    heading: "20. Changes to These Terms",
    body: [
      "Auctra may update these Terms from time to time. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    heading: "21. Contact",
    body: [
      "For questions about these Terms, contact us at [Insert contact email].",
    ],
  },
];

function SectionBody({ body }) {
  return (
    <>
      {body.map((item, i) =>
        typeof item === "object" && item.type === "list" ? (
          <ul key={i} className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 mt-2">
            {item.items.map((li, j) => (
              <li key={j}>{li}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-sm text-slate-600 leading-relaxed mt-2 first:mt-0">
            {item}
          </p>
        )
      )}
    </>
  );
}

export default function TermsAndConditionsPage() {
  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }, []);

  return (
    <main className="min-h-screen bg-neutral1">
      <PageHeader
        eyebrow="Auctra"
        title="Terms and Conditions"
        subtitle="Last updated: 2020/12/12"
      />

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">

        {/* Draft notice */}
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-bold">Note:</span> This is a draft written to match Auctra's
          current product functionality. It is not legal advice, and should be reviewed by a
          qualified lawyer before publication, particularly the sections on liability, payments,
          and dispute resolution.
        </div>

        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              {section.heading}
            </h2>
            <SectionBody body={section.body} />
          </section>
        ))}

        {/* Closing note */}
        <div className="border-t border-slate-200 pt-6 text-xs text-slate-400 italic leading-relaxed">
          This draft is grounded in Auctra's current product behavior (KYC gating, collateral
          deposits, bid mechanics, payment deadlines, and cascade re-offer). Sections in brackets
          require input specific to your business (fees, jurisdiction, age minimum, support
          contact) and legal review before this is published as a binding document.
        </div>
      </div>
    </main>
  );
}
