import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Header() {
  return (
    <header>
      <p className="brand">fun.pump</p>
      <ConnectButton
        label="Sign in"
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
      />
    </header>
  );
}

export default Header;
