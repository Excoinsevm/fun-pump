import { ethers } from "ethers";

function List({ toggleCreate, fee, provider, factory }) {
  async function listHandler(form) {
    const name = form.get("name");
    const ticker = form.get("ticker");
    const image = form.get("image"); // Get the image link

    const signer = await provider.getSigner();

    // Assuming the backend contract can handle metadata or additional storage is used
    const transaction = await factory.connect(signer).create(name, ticker, { value: fee });
    await transaction.wait();

    // Example of storing token data locally (optional)
    console.log({ name, ticker, image }); // Handle image appropriately in your backend or frontend state

    toggleCreate();
  }

  return (
    <div className="list">
      <h2>list new token</h2>

      <div className="list__description">
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form action={listHandler}>
        <input type="text" name="name" placeholder="name" required />
        <input type="text" name="ticker" placeholder="ticker" required />
        <input type="text" name="image" placeholder="image URL" required />
        <input type="submit" value="[ list ]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">[ cancel ]</button>
    </div>
  );
}

export default List;
