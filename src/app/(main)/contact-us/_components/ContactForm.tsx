
// /src/app/contact-us/_components/ContactForm.tsx

"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { sendContactEmail } from "@/app/actions/contactActions";
import { Loader2, Send } from "lucide-react";

// --- Standard Input Styles ---
const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await sendContactEmail(formData);
      if (result.success) {
        toast.success(result.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
        Send us a Message
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {/* ✅ FIX: 'We'll' -> 'We&apos;ll' */}
        We&apos;ll respond as soon as we can.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
          >
            Full Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
          >
            Email Address
          </label>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
        >
          Subject
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="subject"
            id="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className={inputStyles}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
        >
          Your Message
        </label>
        <div className="mt-2">
          <textarea
            name="message"
            id="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleInputChange}
            className={inputStyles}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <Send size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}