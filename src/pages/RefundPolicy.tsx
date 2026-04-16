import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onApplyClick={() => window.location.href = '/apply'} />
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund & Cancellation Policy</h1>
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 text-lg">
          <p>Effective Date: February 20, 2026</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Loan Dispositions</h2>
            <p>
              Once a loan has been approved and funds have been disbursed to your designated account, the transaction is considered final. Due to the nature of financial lending services, disbursed loan amounts are not eligible for "refunds."
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Application Fees</h2>
            <p>
              NyotaFund does not charge upfront application fees. If you have been asked to pay a fee to "unlock" a loan by someone claiming to represent us, please contact our fraud department immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cancellation of Application</h2>
            <p>
              You may cancel your loan application at any time prior to the final signing of the loan agreement and disbursement of funds. To cancel an active application, please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Early Repayment</h2>
            <p>
              Borrowers may choose to repay their loans early. Please refer to your specific loan agreement for details regarding early repayment terms and any potential interest adjustments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
            <p>
              For questions regarding your application or repayment, please contact us:
              <br />
              Email: lonamurunga.dr@gmail.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
