import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-900 border-t border-gray-700 px-3 md:px-6 py-2 md:mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-gray-300">
        <motion.div
          className="flex items-center gap-1"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <span>Made with</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Heart size={14} className="text-red-500" />
          </motion.div>
          <span>for productivity enthusiasts</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-1"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span>Developed by</span>
          <motion.a
            href="https://saurabhsoni.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Saurabh Soni
          </motion.a>
        </motion.div>
      </div>
    </motion.footer>
  );
};
