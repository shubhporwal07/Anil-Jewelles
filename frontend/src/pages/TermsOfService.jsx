import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900 mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to <strong>Anil Jeweller's</strong>. By accessing our website and purchasing our jewelry, you agree to comply with and be bound by the following terms and conditions of use.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">1. General Conditions</h2>
          <p>
            We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (excluding credit card information), may be transferred unencrypted and involve transmissions over various networks.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">2. Product Information and Pricing</h2>
          <p>
            We strive to display our jewelry as accurately as possible. Please note that the exact weight (in grams) of our products is not listed because each piece is highly customizable to your preferences. Additionally, due to the constantly fluctuating price of gold, all prices shown on the website represent the minimum starting price for the products.
          </p>
          <p className="mt-4">
            The final pricing, weight details, and further customization specifics will be communicated and finalized directly with you via phone calls and emails. However, due to the nature of gemstones and precious metals, slight variations in color, size, and final weight may occur. All prices are in Indian Rupees (INR) and are subject to change without notice. In the event of a pricing error, we reserve the right to cancel any orders placed for that item.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">3. Custom Orders and Sizing</h2>
          <p>
            When placing custom orders or requesting specific ring sizes, please ensure all details provided are accurate. We are not responsible for sizing errors made by the customer. Custom-made or personalized jewelry pieces are non-refundable unless defective.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">4. Payment and Billing</h2>
          <p>
            We use Razorpay as our secure payment gateway. By providing a credit card or other payment method, you represent and warrant that you are authorized to use the designated payment method.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">5. Intellectual Property</h2>
          <p>
            All content on this site, including images, designs, logos, and text, is the property of Anil Jeweller's and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">6. Governing Law</h2>
          <p>
            These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Uttar Pradesh, India.
          </p>

          <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4 tracking-wide uppercase">Contact Us</h2>
          <p>
            Questions about the Terms of Service should be sent to us at:<br/>
            <strong>Email:</strong> aniljewellersbharthana@gmail.com
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
