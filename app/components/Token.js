import { ethers } from "ethers";

function Token({ toggleTrade, token }) {
  return (
    <button onClick={() => toggleTrade(token)} className="token">
      <div className="token__details">
        {/* Display the user-provided image */}
        <img
          src={token.image} // Expect the image link to be part of the token data
          alt={`${token.name} logo`}
          width={256}
          height={256}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = "/default-image.png"; // Fallback image
          }}
        />
        <p>created by {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}</p>
        <p>market Cap: {ethers.formatUnits(token.raised, 18)} eth</p>
        <p className="name">{token.name}</p>
      </div>
    </button>
  );
}

export default Token;
