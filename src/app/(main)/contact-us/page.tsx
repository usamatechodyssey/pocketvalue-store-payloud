
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./_components/ContactForm";
import { getGlobalSettings, getBreadcrumbs } from "@/sanity/lib/queries";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// 🔥 FIX: Build Error Solution
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    title: "Contact Us",
    description:
      "Get in touch with PocketValue. We are here to help you with your queries, orders, and feedback.",
    path: "/contact-us",
  });
}

export default async function ContactPage() {
  const [settings, breadcrumbs] = await Promise.all([
    getGlobalSettings(),
    getBreadcrumbs("contact-us"),
  ]);

  return (
    <main className="w-full bg-white dark:bg-gray-900">
      <div className="bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            {/* ✅ FIX: 'We'd' -> 'We&apos;d' */}
            We&apos;d love to hear from you! Whether you have a question about our
            products, an order, or just want to say hello, our team is ready to
            answer all your questions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto mb-12">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Contact Information
            </h2>
            <div className="space-y-6">
              {settings.storeContactEmail && (
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-brand-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Email Us
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our support team will get back to you within 24 hours.
                    </p>
                    <a
                      href={`mailto:${settings.storeContactEmail}`}
                      className="mt-1 text-brand-primary font-medium hover:underline break-all"
                    >
                      {settings.storeContactEmail}
                    </a>
                  </div>
                </div>
              )}

              {settings.storePhoneNumber && (
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-brand-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Call Us
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Mon-Fri from 9am to 6pm PST.
                    </p>
                    <a
                      href={`tel:${settings.storePhoneNumber}`}
                      className="mt-1 text-brand-primary font-medium hover:underline"
                    >
                      {settings.storePhoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {settings.storeAddress && (
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-brand-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Our Office
                    </h3>
                    <p
                      className="text-gray-600 dark:text-gray-400"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {settings.storeAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}