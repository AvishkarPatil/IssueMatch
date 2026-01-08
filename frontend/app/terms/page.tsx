import Link from "next/link"
import { ArrowLeft, FileCheck, Scale, AlertTriangle, Shield } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-[#0d1117] dark:to-black">
      <div className="container mx-auto px-4 py-12 pt-28 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-muted-foreground hover:text-[#e88951] dark:hover:text-[#e88951] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e88951] to-[#d67840] rounded-2xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600 dark:text-muted-foreground text-lg">
            Last updated: January 8, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to IssueMatch! These Terms of Service ("Terms") govern your access to and use of our platform. By accessing or using IssueMatch, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our platform.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Acceptance of Terms
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By creating an account and using IssueMatch, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. You must be at least 13 years old to use this platform.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Account Registration
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To use certain features of IssueMatch, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Have a valid GitHub account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            {/* Use of Platform */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Permitted Use
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You may use IssueMatch to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Discover open source issues that match your skills and interests</li>
                <li>Track your contributions and progress</li>
                <li>Connect with mentors and other contributors</li>
                <li>Participate in the leaderboard and community features</li>
                <li>Generate referral codes to invite others</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Prohibited Activities
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to manipulate the leaderboard or referral system</li>
                <li>Use automated tools to scrape or access the platform</li>
                <li>Interfere with or disrupt the platform's functionality</li>
                <li>Impersonate others or provide false information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            {/* AI Matching Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Matching Service
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our AI-powered matching service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provides recommendations based on your profile and preferences</li>
                <li>Uses machine learning algorithms that continuously improve</li>
                <li>Is provided "as is" without guarantees of accuracy or completeness</li>
                <li>Should be used as a tool to assist, not replace, your judgment</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Intellectual Property
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                All content, features, and functionality of IssueMatch, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Text, graphics, logos, and images</li>
                <li>Software and algorithms</li>
                <li>Design and layout</li>
                <li>Compilation of user-generated content</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                are owned by IssueMatch or its licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            {/* User Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                User-Generated Content
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                By submitting content to IssueMatch (such as profile information, preferences, or feedback), you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content</li>
                <li>Represent that you have the right to share such content</li>
                <li>Acknowledge that we may use your content to improve our services</li>
                <li>Retain ownership of your original content</li>
              </ul>
            </section>

            {/* GitHub Integration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                GitHub Integration
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                IssueMatch integrates with GitHub's API and services. Your use of GitHub data through our platform is also subject to GitHub's Terms of Service and Privacy Policy. We are not responsible for GitHub's services or any changes they make to their platform.
              </p>
            </section>

            {/* Leaderboard and Referrals */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Leaderboard and Referral System
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our leaderboard and referral features:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Display public contribution statistics</li>
                <li>Are based on data from GitHub and our platform</li>
                <li>May be updated periodically</li>
                <li>Do not guarantee any rewards or prizes unless explicitly stated</li>
                <li>May be modified or discontinued at any time</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Any abuse of the referral system may result in account suspension or termination.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                IssueMatch is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or secure. We make no guarantees about the accuracy, completeness, or reliability of any content or recommendations.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To the fullest extent permitted by law, IssueMatch and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Suspend or terminate your account at any time for any reason</li>
                <li>Remove any content that violates these Terms</li>
                <li>Refuse service to anyone</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                You may terminate your account at any time by contacting us.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may modify these Terms at any time. We will notify you of significant changes by posting the updated Terms on this page with a new "Last updated" date. Your continued use of the platform after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Governing Law
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:{" "}
                <a
                  href="mailto:avishkarpatil2003@gmail.com"
                  className="text-[#e88951] hover:text-[#d67840] underline"
                >
                  avishkarpatil2003@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/privacy"
            className="text-gray-600 dark:text-muted-foreground hover:text-[#e88951] dark:hover:text-[#e88951] transition-colors"
          >
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}
