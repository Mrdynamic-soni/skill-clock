import { motion } from 'framer-motion';
import { Mail, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import { SuggestionForm } from '../components/SuggestionForm';

export const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">We'd love to hear from you. Get in touch with us for any questions, feedback, or support.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            
            <div className="space-y-4">
              <motion.div 
                className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <Mail className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">General Support</h3>
                  <p className="text-sm text-gray-600 mb-2">For general questions and support</p>
                  <a href="mailto:ssoni5930@gmail.com" className="text-blue-600 hover:underline">
                    ssoni5930@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 p-4 bg-green-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <Bug className="text-green-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Bug Reports</h3>
                  <p className="text-sm text-gray-600 mb-2">Found a bug? Let us know</p>
                  <a href="mailto:ssoni5930@gmail.com" className="text-green-600 hover:underline">
                    ssoni5930@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <Lightbulb className="text-purple-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Feature Requests</h3>
                  <p className="text-sm text-gray-600 mb-2">Have an idea for improvement?</p>
                  <a href="mailto:ssoni5930@gmail.com" className="text-purple-600 hover:underline">
                    ssoni5930@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <MessageSquare className="text-orange-600 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Business Inquiries</h3>
                  <p className="text-sm text-gray-600 mb-2">Partnership and business questions</p>
                  <a href="mailto:ssoni5930@gmail.com" className="text-orange-600 hover:underline">
                    ssoni5930@gmail.com
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Suggestion Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Feedback</h2>
            <SuggestionForm />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">How do I get started?</h3>
              <p className="text-sm text-gray-600">Create an account, add your first skill, and start tracking time using the timer or manual sessions.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-sm text-gray-600">Yes, all data is encrypted and stored securely in the cloud. Only you have access to your data.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Can I access my data from multiple devices?</h3>
              <p className="text-sm text-gray-600">Yes, your data syncs across all devices when you sign in with the same account.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Where can I find help?</h3>
              <p className="text-sm text-gray-600">Visit the "Help & About" page for detailed guides and submit feedback for any questions.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};