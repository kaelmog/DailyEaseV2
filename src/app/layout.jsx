import "./globals.css";
// Make sure the file in your components folder is named exactly AuthProvider.jsx (Capital A, Capital P)
import AuthProvider from "../components/AuthProvider";

export const metadata = {
  title: "The Wheat ERP",
  description: "Bakery Management and Gramasi System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
