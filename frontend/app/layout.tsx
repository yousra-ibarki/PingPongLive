import type { Metadata } from "next";
import NavBarController from "./Components/NavBarController";
import "./globals.css";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        
      <body className={` bg-[#222831]  fade-in`}>
        <NavBarController />
        {children}
      </body>
    </html>
  );
}
