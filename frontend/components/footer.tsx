import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#0a0a0a] backdrop-blur supports-[backdrop-filter]:bg-gray-50 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/60 border-t border-gray-200 dark:border-border shadow-sm dark:shadow-none">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#e88951] via-[#f59e6c] to-[#e88951] bg-clip-text text-transparent mb-4">
              IssueMatch
            </h2>
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              Connecting developers with their perfect open source issues using
              AI-powered matching.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/AvishkarPatil/IssueMatch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>

              {/* <a 
    href="https://twitter.com/your_handle" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent"
  >
    <Twitter className="w-5 h-5" />
    <span className="sr-only">Twitter</span>
  </a>

  <a 
    href="https://www.linkedin.com/in/your_profile" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent"
  >
    <Linkedin className="w-5 h-5" />
    <span className="sr-only">LinkedIn</span>
  </a> */}

              <a
                href="mailto:avishkarpatil2003@gmail.com"
                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-accent"
              >
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-muted-foreground text-sm">
            © 2026 Avishkar Patil. All rights reserved.
          </p>
          <p className="text-gray-600 dark:text-muted-foreground text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for open
            source
          </p>
        </div>
      </div>
    </footer>
  );
}
