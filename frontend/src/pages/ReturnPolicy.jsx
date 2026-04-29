import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900 mb-8">
          Return & Exchange Policy
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>Anil Jeweller's</strong>, we take immense pride in the craftsmanship and quality of our jewelry. If for any reason you are not completely satisfied with your purchase, we offer a straightforward return and exchange policy.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">1. Standard Returns</h2>
          <p>
            We accept returns on regular stock items within <strong>14 days</strong> of the delivery date. To be eligible for a return, the jewelry must be unworn, in its original pristine condition, and accompanied by the original packaging, certificates, and receipt.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">2. Non-Returnable Items</h2>
          <p>
            The following items cannot be returned or exchanged:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Custom-designed or personalized jewelry (including engraved items).</li>
            <li>Rings that have been resized upon customer request before shipping.</li>
            <li>Items that show signs of wear, damage, or alteration.</li>
            <li>Gold coins or bullion (due to market price fluctuations).</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">3. Lifetime Exchange & Buyback</h2>
          <p>
            We offer a lifetime exchange and buyback policy for all diamond and gold jewelry purchased from us, subject to our quality check:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Gold Jewelry:</strong> Exchanged at 100% of the current prevailing gold weight rate. Buyback is at 96% of the current rate. Making charges and taxes are non-refundable.</li>
            <li><strong>Diamond Jewelry:</strong> Exchanged at 90% of the current invoice value. Buyback is at 80% of the current invoice value.</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">4. Return Process</h2>
          <p>
            To initiate a return, please follow these steps:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact our customer support team at <strong>aniljewellersbharthana@gmail.com</strong> or call us at <strong>+91-9997364680</strong>.</li>
            <li>Safely pack the jewelry in its original box with all accompanying documents.</li>
            <li>Ship the package via a secure, trackable, and insured shipping method. The customer is responsible for return shipping costs.</li>
          </ol>
          <p>
            Once we receive and inspect the item, we will process your refund to the original payment method within 7-10 business days.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
