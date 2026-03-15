import "./globals.css";
// Make sure the file in your components folder is named exactly AuthProvider.jsx (Capital A, Capital P)
import AuthProvider from "../components/AuthProvider";

export const metadata = {
  title: "DailyEase TW",
  description: "Closing harian jadi lebih mudah",
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
