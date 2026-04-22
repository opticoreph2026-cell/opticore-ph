import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'Terms of Service | OptiCore PH',
  description: 'Terms of Service for using OptiCore PH utility bill optimization.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-brand">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-semibold text-text-primary mb-4">Terms of Service</h1>
            <p className="text-text-secondary">Last updated: April 2026</p>
          </div>

          <div className="card border-white/[0.06] p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                By accessing and using OptiCore PH, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our service. This agreement is governed by the laws of the Republic of the Philippines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">2. Service Description</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                OptiCore PH provides AI-powered utility bill analysis and energy optimization recommendations using Google Gemini multmodal models. The projections, calculations, and ROI simulations are estimates based on user-provided data and public benchmark data (like DOE PELP), not financial guarantees.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">3. Data Privacy and PDPA Compliance</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We strictly adhere to the Philippine Data Privacy Act of 2012 (RA 10173). Your bills, personal usage data, and authentication details are encrypted and securely stored. We only use your data to generate energy reports and do not sell your personal information to third parties. For complete details, see our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">4. User Responsibilities</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                You are responsible for the accuracy of the bills and appliances you upload/register. You must also maintain the confidentiality of your account credentials. You agree not to upload malicious files or attempt to compromise the system&apos;s security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">5. Subscription & Payment Policy</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Pro and Business tier subscriptions are processed securely via PayMongo. Payments are billed monthly or annually and are generally non-refundable except where required by local consumer protection laws. You may cancel your subscription at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">6. Limitation of Liability</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                OptiCore PH and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services. Your utility provider ultimately dictates your actual billing rates and consumption charges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">7. Contact Us</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                If you have any questions about these Terms, please contact us at:{' '}
                <a href="mailto:opticoreph2026@gmail.com" className="text-brand-400 hover:text-brand-300 hover:underline transition-colors">opticoreph2026@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
