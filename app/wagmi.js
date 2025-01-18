import { defineChain } from 'viem'; 
import { getDefaultConfig } from '@rainbow-me/rainbowkit'; 
import { createPublicClient, http } from 'viem'; 

// Define a custom blockchain network with necessary details
const customChain = defineChain({
  id: 7171, // The unique identifier for the custom blockchain network
  name: 'Bitrock Mainnet', // The name of the blockchain network
  nativeCurrency: { 
    name: 'Bitrock', // The name of the native token for this chain
    symbol: 'BROCK', // The symbol for the native token
    decimals: 18, // Number of decimals for the token
  },
  rpcUrls: {
    default: { http: ['https://connect.bit-rock.io'] }, // The URL for connecting to the blockchain network
  },
  blockExplorers: {
    default: { 
      name: 'Bitrock Explorer', // The name of the blockchain explorer
      url: 'https://explorer.bit-rock.io', // URL for the blockchain explorer
    },
  },
});

// Create a public client instance for interacting with the custom blockchain
const customChainClient = createPublicClient({
  chain: customChain, // The custom chain definition
  transport: http(customChain.rpcUrls.default.http[0]), // HTTP transport using the chain's RPC URL
});

// Configure RainbowKit with the custom chain and related settings
const config = getDefaultConfig({
  appName: 'My RainbowKit App', // The name of the application using RainbowKit
  projectId: 'YOUR_PROJECT_ID', // WalletConnect Project ID for authentication go to https://reown.com
  chains: [customChain], // List of chains, including the custom chain
  publicClients: [customChainClient], // List of public clients for chain interaction
  ssr: true, // Enable server-side rendering support
});

// Export the configuration object for use in the application
export default config;
