import type { Metadata } from "next";
import NavBarController from "./Components/NavBarController";
import { WebSocketProviderForChat } from "./Components/WebSocketContext";
import "./globals.css";
import { WebSocketProvider } from "./game/webSocket";


export const metadata: Metadata = {
  title: "Ping Pong",
  description: "Developed by: Matefhemch team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        
      <body className={` bg-[#222831] fade-in`}>
       <WebSocketProviderForChat>
        <NavBarController />
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
        </WebSocketProviderForChat>
      </body>
    </html>
  );
}
