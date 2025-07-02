import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { Metadata } from "next";

const pressStart2P = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={pressStart2P.className}>
        <AuthProvider>
          <ProfileProvider>
            <CollectionProvider>{children}</CollectionProvider>
          </ProfileProvider>
        </AuthProvider>
        <footer
          style={{
            textAlign: "center",
            fontSize: 12,
            margin: "32px 0 8px 0",
            color: "#888",
          }}
        >
          This site uses cookies for session management. You can delete your
          profile and all associated data at any time from your profile page.
          This complies with GDPR requirements.
        </footer>
      </body>
    </html>
  );
}
