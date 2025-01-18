import { Nabla } from "next/font/google";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import wagmiConfig from "./wagmi"; // Assuming wagmi.js is in the root directory
import "@rainbow-me/rainbowkit/styles.css"; // Import RainbowKit styles
import "./globals.css";

const nabla = Nabla({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nabla.className}`}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            modalSize="compact"
            theme={darkTheme({
              accentColor: "#7b3fe4",
              accentColorForeground: "white",
              borderRadius: "medium",
            })}
          >
            {children}
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
