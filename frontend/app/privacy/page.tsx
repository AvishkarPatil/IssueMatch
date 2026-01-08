import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent">
              Privacy Policy
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
                At IssueMatch, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Information We Collect
                </h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                GitHub Authentication Data
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When you sign in with GitHub, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Your GitHub username and profile information</li>
                <li>Your public repositories and contribution history</li>
                <li>Your email address associated with your GitHub account</li>
                <li>Your GitHub profile picture</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Skills and Preferences
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We collect information about:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Programming languages and frameworks you're proficient in</li>
                <li>Your areas of interest in open source</li>
                <li>Your experience level and preferences</li>
                <li>Issues you've bookmarked or expressed interest in</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Usage Data
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We automatically collect certain information when you use our platform, including IP address, browser type, device information, and pages visited.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  How We Use Your Information
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Match you with relevant open source issues based on your skills and interests</li>
                <li>Provide personalized recommendations using AI</li>
                <li>Display your contribution statistics and leaderboard rankings</li>
                <li>Improve our matching algorithms and user experience</li>
                <li>Communicate with you about platform updates and features</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-[#e88951]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                  Data Security
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Public Information:</strong> Your GitHub profile and contribution data that is already public</li>
                <li><strong>Service Providers:</strong> With third-party services that help us operate our platform (e.g., Google AI, MongoDB)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Your Rights
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of certain data collection practices</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and maintain your session. You can control cookie settings through your browser preferences.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our platform integrates with the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>GitHub:</strong> For authentication and repository data</li>
                <li><strong>Google AI (Gemini):</strong> For AI-powered matching and recommendations</li>
                <li><strong>MongoDB Atlas:</strong> For data storage</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                These services have their own privacy policies, which we encourage you to review.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
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
            href="/terms"
            className="text-gray-600 dark:text-muted-foreground hover:text-[#e88951] dark:hover:text-[#e88951] transition-colors"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}
