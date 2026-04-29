import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900 mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>Anil Jeweller's</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or purchase our artisanal jewelry.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">1. Information We Collect</h2>
          <p>
            When you create an account, place an order, or subscribe to our newsletter, we may collect the following information:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Personal identification information (Name, email address, phone number)</li>
            <li>Shipping and billing addresses</li>
            <li>Payment details (processed securely via our payment gateway)</li>
            <li>Purchase history and ring/jewelry size preferences</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and fulfill your orders accurately.</li>
            <li>To provide updates on your order status and shipping.</li>
            <li>To send you newsletters, promotional offers, and updates on new collections (only if you have opted in).</li>
            <li>To improve our website's user experience and customer service.</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">3. Data Security</h2>
          <p>
            We implement advanced security measures, including SSL encryption, to protect your personal and payment information from unauthorized access, alteration, disclosure, or destruction. We do not store your credit card information directly; it is securely processed by Razorpay.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">4. Sharing Your Information</h2>
          <p>
            We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates for the purposes outlined above.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. If you wish to unsubscribe from our newsletter, you can do so by contacting us directly.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:<br/>
            <strong>Email:</strong> aniljewellersbharthana@gmail.com<br/>
            <strong>Phone:</strong> +91-9997364680
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
