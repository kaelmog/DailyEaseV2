import "./globals.css";

export const metadata = {
  title: "The Wheat | Operational System",
  description: "Internal daily closing and inventory system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
