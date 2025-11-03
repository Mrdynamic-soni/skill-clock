import { motion } from 'framer-motion';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <p className="mb-3">SkillClock collects minimal information to provide our service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address and name for account creation</li>
              <li>Skill tracking data (skills, time entries, sessions)</li>
              <li>Profile information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the SkillClock service</li>
              <li>To authenticate your account</li>
              <li>To store and sync your skill tracking data</li>
              <li>To respond to your support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage and Security</h2>
            <p className="mb-3">Your data is stored securely using Supabase infrastructure:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All data is encrypted in transit and at rest</li>
              <li>We use industry-standard security practices</li>
              <li>Your data is only accessible to you</li>
              <li>We do not sell or share your personal data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at ssoni5930@gmail.com</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};