import { Press_Start_2P } from "next/font/google";
import "nes.css/css/nes.min.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CollectionProvider } from "@/contexts/CollectionContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

const pressStart2P = Press_Start_2P({ weight: "400", subsets: ["latin"] });

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
      </body>
    </html>
  );
}
