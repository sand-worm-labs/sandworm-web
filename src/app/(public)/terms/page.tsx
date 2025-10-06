import React from "react";

export const metadata = {
  title: "Terms & Conditions – Sandworm",
  description: "Read the terms and conditions for using the Sandworm Web App",
};

export default function Terms() {
  return (
    <div className="bg-black text-text-gray min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-12 mt-12">
        <section>
          <h1 className="text-3xl font-medium mb-4 uppercase dark:text-white">
            Terms and Conditions
          </h1>
          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>Sandworm</strong>, you agree to comply
            with these Terms and Conditions. If you do not agree, do not use the
            service. These terms may be updated periodically, and continued use
            constitutes acceptance of any changes.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 text-white">
            2. Description of Service
          </h2>
          <p>
            <strong>Sandworm</strong> is an open-source analytics tool that
            enables users to query blockchain data (including
            <strong> Sui, Etherium, EVM chains</strong>,and potentially other
            blockchains) using an SQL-like language. It also provides a
            <strong> public gist</strong> for sharing and discovering queries.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            3. Use of the Service
          </h2>
          <ul className="list-disc pl-6">
            <li>
              Sandworm is for informational purposes only and does not guarantee
              data accuracy.
            </li>
            <li>
              Users must not use the tool for illegal activities, including
              hacking, unauthorized scraping, or fraudulent transactions.
            </li>
            <li>
              Queries shared in the public gist must not contain malicious code,
              copyrighted material, or personally identifiable information.
            </li>
          </ul>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            4. Open Sourc e License and Contributions
          </h2>
          <p>
            Sandworm is open-source, and contributions are subject to its
            respective license (e.g., MIT, GPL). The platform is provided "as
            is," and contributors bear no liability for third-party
            modifications or misuse.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            5. User-Generated Content
          </h2>
          <p>
            By submitting queries to the public gist, users grant Sandworm a
            non-exclusive, royalty-free right to display and distribute them.
            Sandworm reserves the right to remove or moderate content violating
            these terms.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            6. Disclaimers and Limitations of Liability
          </h2>
          <ul className="list-disc pl-6">
            <li>
              Sandworm does not provide financial, investment, or legal advice.
            </li>
            <li>
              The team is not responsible for losses resulting from reliance on
              queried data.
            </li>
            <li>Blockchain data may be incomplete, inaccurate, or outdated.</li>
          </ul>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            7. Authentication and Security
          </h2>
          <p>
            Sandworm uses Firebase for authentication, which may involve
            third-party social logins. Users are responsible for securing their
            accounts and should not share login credentials.
          </p>
        </section>

        <section>
          <h1 className="text-3xl font-bold mb-4 dark:text-white uppercase">
            Privacy Policy
          </h1>
          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6">
            <li>
              <strong>Authentication Data:</strong> When users log in via
              Firebase (including Google, GitHub, or other social logins),
              authentication tokens are stored.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect anonymous usage analytics
              to improve the platform.
            </li>
            <li>
              <strong>Cookies:</strong> Cookies are used for authentication,
              session management, and performance tracking.
            </li>
          </ul>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            2. How We Use Your Data
          </h2>
          <p>
            Authentication data is used solely for managing user access. Usage
            analytics help optimize the tool but do not personally identify
            users. Public queries shared in the gist are visible to all users.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            3. Data Sharing and Security
          </h2>
          <p>
            We <strong>do not sell or share personal data</strong> with third
            parties. We take reasonable measures to secure user data but cannot
            guarantee complete security.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            4. Third-Party Services
          </h2>
          <p>
            Firebase authentication follows{" "}
            <strong>Google’s Privacy Policy</strong>. Queries may interact with
            third-party APIs (e.g., blockchain explorers), which have their own
            privacy policies.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark:text-white">
            5. Blockchain and Public Data
          </h2>
          <p>
            Queries return <strong>publicly available</strong> blockchain data;
            we do not control blockchain records. Users should not store
            sensitive data in public queries.
          </p>

          <h2 className="text-2xl font-medium mt-6 mb-4 dark: text-white">
            6. Your Choices
          </h2>
          <ul className="list-disc pl-6">
            <li>Users can manage authentication settings via Firebase.</li>
            <li>Clearing cookies may impact authentication and performance.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
