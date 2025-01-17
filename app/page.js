"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Header from "./components/Header";
import List from "./components/List";
import Token from "./components/Token";
import Trade from "./components/Trade";

// ABIs & Config
import Factory from "./abis/Factory.json";
import config from "./config.json";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [token, setToken] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

  function toggleCreate() {
    setShowCreate((prevState) => !prevState);
  }

  function toggleTrade(token) {
    setToken(token);
    setShowTrade((prevState) => !prevState);
  }

  async function loadBlockchainData() {
    // Use MetaMask for connection
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    // Get the current network
    const network = await provider.getNetwork();

    // Create reference to Factory contract
    const factory = new ethers.Contract(
      config[network.chainId].factory.address,
      Factory,
      provider
    );
    setFactory(factory);

    // Fetch the fee
    const fee = await factory.fee();
    setFee(fee);

    // Fetch token details
    const totalTokens = await factory.totalTokens();
    const tokens = [];

    for (let i = 0; i < totalTokens; i++) {
      const tokenSale = await factory.getTokenSale(i);

      // Ensure the token data includes an `image` field.
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: tokenSale.image || "/default-image.png", // Fallback image if not set
      };

      tokens.push(token);
    }

    // Display the most recent tokens first
    setTokens(tokens.reverse());
  }

  useEffect(() => {
    loadBlockchainData();
  }, [showCreate, showTrade]);

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button
            onClick={factory && account && toggleCreate}
            className="btn--fancy"
          >
            {!factory
              ? "[ contract not deployed ]"
              : !account
              ? "[ please connect ]"
              : "[ start a new token ]"}
          </button>
        </div>

        <div className="listings">
          <h1>new listings</h1>

          <div className="tokens">
            {!account ? (
              <p>please connect wallet</p>
            ) : tokens.length === 0 ? (
              <p>No tokens listed</p>
            ) : (
              tokens.map((token, index) => (
                <Token toggleTrade={toggleTrade} token={token} key={index} />
              ))
            )}
          </div>
        </div>

        {showCreate && (
          <List
            toggleCreate={toggleCreate}
            fee={fee}
            provider={provider}
            factory={factory}
          />
        )}

        {showTrade && (
          <Trade
            toggleTrade={toggleTrade}
            token={token}
            provider={provider}
            factory={factory}
          />
        )}
      </main>
    </div>
  );
}
