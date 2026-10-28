import React from 'react';
import {
  X,
  FileText,
  Shield,
  Truck,
  RotateCcw,
  Ban,
  Mail,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SPRING_BOOT_POM_XML,
  FLYWAY_V1_SQL,
  SPRING_BOOT_CLOTHING_VALIDATOR,
} from '../docs/BackendSpringDoc';

export const PoliciesModal: React.FC = () => {
  const { activePolicyModal, setActivePolicyModal, addToast } = useApp();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!activePolicyModal) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied code to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderContent = () => {
    switch (activePolicyModal) {
      case 'terms':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">
              Marketplace Terms of Service & Wholesaler Code
            </h3>
            <p>
              Welcome to <strong>Loot Your Look</strong>. By accessing or using this marketplace, you agree to comply with these Terms and applicable Indian laws including the Consumer Protection Act, 2019 and Information Technology Act, 2000.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">1. Strict Clothing-Only Rule</h4>
            <p>
              Loot Your Look is strictly a clothing and apparel marketplace. The sale, listing, or promotion of footwear, jewellery, watches, handbags, luggage, cosmetics, personal care, electronics, or non-apparel items is categorically prohibited. Wholesalers violating this rule face immediate account suspension and forfeiture of marketplace privileges.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">2. Wholesaler Marketplace Model</h4>
            <p>
              Loot Your Look operates as an intermediary marketplace connecting customers with verified clothing wholesalers across India. Wholesalers are responsible for product accuracy, fabric composition disclosures, and order fulfillment.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">3. Pricing & Taxes</h4>
            <p>
              All prices are listed in Indian Rupees (₹ INR) and include applicable Goods and Services Tax (GST) on apparel (5% or 12% as applicable).
            </p>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">Privacy Policy</h3>
            <p>
              We respect your privacy and protect personal data under the Digital Personal Data Protection Act (DPDPA), 2023.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">Data Collected</h4>
            <p>
              We collect your name, shipping address, mobile number, and email strictly for processing clothing orders, shipping updates, and invoice generation. We never sell or rent your personal information to third-party advertisers.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">Payment Security</h4>
            <p>
              All online payment card numbers, UPI credentials, and bank tokens are processed via RBI-authorized payment aggregators (e.g., Razorpay) using 256-bit encryption. Loot Your Look does not store raw credit/debit card numbers or CVVs.
            </p>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">Shipping & Delivery Policy</h3>
            <p>
              We partner with India's premier logistics providers including BlueDart, Delhivery, DTDC, and Xpressbees to deliver nationwide across 19,000+ Indian pincodes.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">Split Fulfillment Dispatches</h4>
            <p>
              Because Loot Your Look connects you directly with regional textile hubs (Surat, Tirupur, Jaipur, Ludhiana), items in your cart from different wholesalers will be dispatched in separate packages to ensure the fastest direct-from-mill delivery.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">Timelines & Charges</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders above ₹999 qualify for <strong>FREE Express Shipping</strong>.</li>
              <li>A nominal fee of ₹49 applies to orders under ₹999.</li>
              <li>Standard delivery takes 3 to 6 business days depending on destination pincode.</li>
            </ul>
          </div>
        );

      case 'return':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">
              10-Day Clothing Return & Refund Policy
            </h3>
            <p>
              We want you to love your style. If a garment doesn't fit or meet your expectations, we offer a hassle-free 10-day return or size exchange.
            </p>
            <h4 className="font-bold text-stone-900 text-sm">Return Eligibility</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Item must be unused, unwashed, and in original condition with tags intact.</li>
              <li>Sarees and ethnic wear must include the original unstitched blouse piece.</li>
              <li>Pickup is conducted from your original delivery address free of charge.</li>
            </ul>
            <h4 className="font-bold text-stone-900 text-sm">Refund Timeline</h4>
            <p>
              Once the returned garment is inspected by the wholesaler hub, your refund is initiated within 48 hours to the original payment method (or bank account for COD orders).
            </p>
          </div>
        );

      case 'cancellation':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">Order Cancellation Policy</h3>
            <p>
              Customers can cancel an order at any time before the package is marked as <strong>SHIPPED</strong> by the wholesaler directly from their Customer Dashboard.
            </p>
            <p>
              Once a package has been dispatched with an assigned courier AWB tracking number, cancellation cannot be processed directly, but you can refuse delivery at your doorstep or initiate a return upon receipt.
            </p>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-stone-900">
              Customer Support & Grievance Redressal
            </h3>
            <p>
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
            </p>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <p className="font-bold text-stone-900">Grievance Officer:</p>
              <p>Name: Shiva Chethan</p>
              <p>Designation: Compliance & Customer Grievance Officer</p>
              <p>Email: shivachethan6055@gmail.com</p>
              <p>Platform: Loot Your Look Marketplace Private Limited</p>
              <p>Response Time: Within 24-48 business hours</p>
            </div>
          </div>
        );

      case 'backend-docs':
        return (
          <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                Production Java 21 + Spring Boot 3 + MySQL 8 Architecture
              </h3>
              <p className="text-stone-500 mt-1">
                Complete backend specifications, Maven pom.xml, and Flyway migration SQL with strict clothing-only DB constraints.
              </p>
            </div>

            {/* Flyway SQL */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-stone-900 font-mono">
                  src/main/resources/db/migration/V1__init_clothing_marketplace.sql
                </span>
                <button
                  onClick={() => handleCopy(FLYWAY_V1_SQL, 'sql')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-60">
                {FLYWAY_V1_SQL}
              </pre>
            </div>

            {/* Spring Boot pom.xml */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-stone-900 font-mono">pom.xml (Spring Boot 3.3.4 & Java 21)</span>
                <button
                  onClick={() => handleCopy(SPRING_BOOT_POM_XML, 'pom')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'pom' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pom' ? 'Copied' : 'Copy pom.xml'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-60">
                {SPRING_BOOT_POM_XML}
              </pre>
            </div>

            {/* Clothing Only Validator */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-stone-900 font-mono">ClothingOnlyValidator.java</span>
                <button
                  onClick={() => handleCopy(SPRING_BOOT_CLOTHING_VALIDATOR, 'validator')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'validator' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'validator' ? 'Copied' : 'Copy Java'}</span>
                </button>
              </div>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-60">
                {SPRING_BOOT_CLOTHING_VALIDATOR}
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto my-4 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => setActivePolicyModal(null)}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => setActivePolicyModal(null)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
