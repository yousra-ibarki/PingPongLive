import type { Metadata } from "next";
import NavBarController from "./Components/NavBarController";
import { WebSocketProviderForChat } from "./Components/WebSocketContext";
import "../globals.css";
import { WebSocketProvider } from "./game/webSocket" 

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <WebSocketProvider>
        <WebSocketProviderForChat>
            <NavBarController />
            {children}
        </WebSocketProviderForChat>
        </WebSocketProvider>
    );
    }