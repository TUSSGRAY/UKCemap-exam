import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: November 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <section data-testid="section-introduction">
            <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-foreground">
                  J&K CeMAP Training ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
                <p className="text-muted-foreground text-sm">
                  Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Information We Collect */}
          <section data-testid="section-collected-data">
            <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information You Provide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Email Address</p>
                    <p className="text-sm text-muted-foreground">
                      Collected during registration and login. Used for account management, authentication, password recovery, and to send important updates about your account and our services.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Username/Display Name</p>
                    <p className="text-sm text-muted-foreground">
                      Provided during registration. Used to identify your account and display your name on leaderboards with your consent. You may update this information at any time from your profile settings.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Stored securely using industry-standard bcrypt hashing. We never store your password in plain text and cannot retrieve it. If you forget your password, we provide a secure reset process.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Automatically Collected Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">Quiz Performance Data</p>
                    <p className="text-sm text-muted-foreground">
                      We collect information about your quiz attempts, including scores, answers, time spent, topics attempted, and completion status. This data is used to generate your performance analytics, provide feedback, award certificates, and track progress. This information is tied to your user account.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Session Information</p>
                    <p className="text-sm text-muted-foreground">
                      We collect session tokens and identifiers to maintain your login state and personalize your experience.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="font-semibold text-foreground">Device and Browser Information</p>
                    <p className="text-sm text-muted-foreground">
                      Information about your device type, browser, operating system, and IP address for security and analytics purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Payment processing is handled securely by Stripe. We do not store credit card or banking information on our servers. Stripe retains only the necessary payment data in accordance with PCI DSS compliance standards.
                  </p>
                  <p>
                    We store payment intent IDs and information about your purchases (what was purchased, when, and price) to manage your access to quiz modes and generate receipts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Information NOT Collected */}
          <section data-testid="section-not-collected">
            <h2 className="text-2xl font-bold text-foreground mb-4">Information We Do NOT Collect</h2>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <p className="text-foreground"><strong>Phone Numbers:</strong> We do not request or collect phone numbers during registration or service provision.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <p className="text-foreground"><strong>Personal Messages or Chat:</strong> We do not collect messages between users or maintain messaging systems. The only information we collect is quiz-related data.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <p className="text-foreground"><strong>Location Data:</strong> We do not collect precise location information, though we may infer general location from IP addresses for analytics.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How We Use Information */}
          <section data-testid="section-data-usage">
            <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To create and manage your user account</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To provide quiz functionality and track your progress</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To generate performance analytics and personalized feedback</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To process payments and manage access to paid quiz modes</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To award certificates when you achieve the 80% pass threshold</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To display your name on leaderboards (only with your explicit consent)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To send service-related communications about account updates and feature changes</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To improve our services through analytics and usage patterns</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>To maintain security and prevent fraudulent activity</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section data-testid="section-data-security">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, and disclosure. These include:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• HTTPS encryption for all data in transit</li>
                  <li>• Bcrypt password hashing with secure salt generation</li>
                  <li>• Session-based authentication with secure tokens</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Restricted access to personal data (limited to authorized personnel only)</li>
                </ul>
                <p className="border-t border-border pt-4">
                  However, no security system is completely impenetrable. We cannot guarantee absolute security of your data. If you believe your account has been compromised, please contact us immediately.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Data Retention */}
          <section data-testid="section-data-retention">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
                <p>
                  We retain your personal information for as long as your account remains active and as necessary to provide our services. Specifically:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Account Information:</strong> Retained until you request account deletion</li>
                  <li>• <strong>Quiz Performance Data:</strong> Retained for the lifetime of your account for analytics and progress tracking</li>
                  <li>• <strong>Payment Records:</strong> Retained for 7 years to comply with UK tax and financial regulations</li>
                  <li>• <strong>Session Data:</strong> Automatically cleared when you log out</li>
                </ul>
                <p className="border-t border-border pt-4">
                  Upon account deletion, we remove your personal information from our active systems within 30 days, except where retention is required by law.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Sharing Information */}
          <section data-testid="section-data-sharing">
            <h2 className="text-2xl font-bold text-foreground mb-4">Do We Share Your Information?</h2>
            <Card>
              <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
                <p>
                  We do not sell your personal information to third parties. However, we may share information in the following limited circumstances:
                </p>
                <div className="space-y-3 ml-4">
                  <div>
                    <p className="font-semibold text-foreground">Service Providers</p>
                    <p>Stripe (payment processing), Replit (hosting), and other vendors who assist in operating our website and services. These providers are contractually obligated to use your information only as necessary to provide services to us.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Legal Compliance</p>
                    <p>If required by law, court order, or government request, we may disclose personal information.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Leaderboards</p>
                    <p>Your name and high scores are displayed publicly on leaderboards only if you provide explicit consent during quiz completion. You can opt out at any time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Rights */}
          <section data-testid="section-user-rights">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Under UK GDPR and UK Data Protection Act 2018, you have the right to:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Access:</strong> Request a copy of your personal information</li>
                  <li>• <strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                  <li>• <strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li>• <strong>Restriction:</strong> Request restrictions on how we use your data</li>
                  <li>• <strong>Portability:</strong> Request your data in a portable format</li>
                  <li>• <strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
                <p className="border-t border-border pt-4">
                  To exercise any of these rights, please contact us at the email address below with your request.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Children's Privacy */}
          <section data-testid="section-children-privacy">
            <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground space-y-3">
                <p>
                  Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will promptly delete such information.
                </p>
                <p>
                  For users aged 13-18, we provide additional privacy protections and recommend parental consent before creating an account.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Changes to Policy */}
          <section data-testid="section-policy-changes">
            <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground space-y-3">
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date above.
                </p>
                <p>
                  Your continued use of our services following the posting of revised Privacy Policy means that you accept and agree to the changes.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section data-testid="section-contact">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">training@ukcemap.co.uk</span></p>
                  <p><strong className="text-foreground">Website:</strong> <span className="text-muted-foreground">ukcemap.co.uk</span></p>
                  <p className="text-xs text-muted-foreground pt-2">
                    We will respond to legitimate requests within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Legal Compliance Notice */}
          <section data-testid="section-legal-compliance" className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">Legal Compliance Notice</h3>
            <p className="text-sm text-muted-foreground">
              This Privacy Policy complies with:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
              <li>• UK General Data Protection Regulation (UK GDPR)</li>
              <li>• Data Protection Act 2018 (UK)</li>
              <li>• Privacy and Electronic Communications (EC Directive) Regulations 2003 (PECR)</li>
              <li>• Computer Misuse Act 1990</li>
              <li>• Regulation of Investigatory Powers Act 2000 (RIPA)</li>
            </ul>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 flex justify-center">
          <Link href="/">
            <Button size="lg" data-testid="button-return-home">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
