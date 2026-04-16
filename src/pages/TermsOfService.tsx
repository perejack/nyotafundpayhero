import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onApplyClick={() => window.location.href = '/apply'} />
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-lg">
          <p>Effective Date: February 20, 2026</p>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the NyotaFund website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
            <p>
              To use our services, you must be at least 18 years old and have the legal capacity to enter into a binding agreement. You are responsible for ensuring all information you provide is accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Loan Applications</h2>
            <p>
              Submitting a loan application does not guarantee approval. All loans are subject to credit checks and internal risk assessments. We reserve the right to deny any application at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Conduct</h2>
            <p>
              You agree not to use the site for any unlawful purpose or to engage in any activity that could damage, disable, or impair the site's functionality. This includes, but is not limited to, fraudulent applications or unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p>
              All content, logos, and software on this site are the property of NyotaFund and are protected by intellectual property laws. You may not reproduce or distribute any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p>
              NyotaFund shall not be liable for any direct, indirect, or incidental damages arising from your use of the site or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of ELDORET, Kenya.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
