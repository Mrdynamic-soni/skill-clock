import { motion } from 'framer-motion';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p>By accessing and using SkillClock, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Use License</h2>
            <p className="mb-3">Permission is granted to temporarily use SkillClock for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">User Account</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for maintaining account security</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>We reserve the right to terminate accounts for violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Uses</h2>
            <p className="mb-3">You may not use SkillClock:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>For any unlawful purpose</li>
              <li>To transmit harmful or malicious content</li>
              <li>To violate any applicable laws or regulations</li>
              <li>To interfere with the service or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Disclaimer</h2>
            <p>SkillClock is provided "as is" without any representations or warranties. We do not warrant that the service will be uninterrupted or error-free.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p>In no event shall SkillClock be liable for any damages arising out of the use or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to us at ssoni5930@gmail.com</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};