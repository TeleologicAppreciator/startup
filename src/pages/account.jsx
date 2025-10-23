import React from "react";

export default function Account({ userName }) {
  const [funds, setFunds] = React.useState(10000);
  const [stocks, setStocks] = React.useState([]);
  const [symbol, setSymbol] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    const savedFunds = localStorage.getItem("funds");
    const savedStocks = localStorage.getItem("stocks");
    if (savedFunds) setFunds(parseFloat(savedFunds));
    if (savedStocks) setStocks(JSON.parse(savedStocks));
  }, []);

  React.useEffect(() => {
    localStorage.setItem("funds", funds.toString());
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [funds, stocks]);

  const STOCK_PRICE = 100;

  function handleBuy(e) {
    e.preventDefault();
    if (!symbol) return;

    const cost = STOCK_PRICE * quantity;

    if (funds < cost) {
      alert("Not enough funds!");
      return;
    }

    const existing = stocks.find((s) => s.symbol === symbol.toUpperCase());
    let updatedStocks;
    if (existing) {
      updatedStocks = stocks.map((s) =>
        s.symbol === symbol.toUpperCase()
          ? {
              ...s,
              owned: s.owned + quantity,
              totalCost: (s.owned + quantity) * STOCK_PRICE,
            }
          : s
      );
    } else {
      updatedStocks = [
        ...stocks,
        {
          symbol: symbol.toUpperCase(),
          owned: quantity,
          pricePer: STOCK_PRICE,
          totalCost: quantity * STOCK_PRICE,
        },
      ];
    }

    setFunds((prev) => prev - cost);
    setStocks(updatedStocks);
    setSymbol("");
    setQuantity(1);
  }

  function increaseQuantity() {
    setQuantity((q) => q + 1);
  }

  function decreaseQuantity() {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  }

  const totalAllocated = stocks.reduce((sum, s) => sum + s.totalCost, 0);

  return (
    <div>
      <main>
        <h2 className="welcome-title">
          Hello, {userName.split("@")[0]}!
        </h2>
        <p className="unallocated-funds">
          Unallocated funds: ${funds.toFixed(2)}
        </p>

        <form onSubmit={handleBuy}>
          <div>
            <input
              type="text"
              placeholder="Stock symbol to buy"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <button type="submit">Buy</button>
          </div>
          <p>
            Price: ${STOCK_PRICE.toFixed(2)} × {quantity}{" "}
            <button type="button" onClick={increaseQuantity}>
              +
            </button>{" "}
            <button type="button" onClick={decreaseQuantity}>
              -
            </button>
          </p>
        </form>

        <p className="allocated-funds">
          Allocated funds: ${totalAllocated.toFixed(2)}
        </p>

        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Total Cost</th>
              <th>Owned</th>
              <th>Price Per</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length > 0 ? (
              stocks.map((s, i) => (
                <tr key={i}>
                  <td>{s.symbol}</td>
                  <td>${s.totalCost.toFixed(2)}</td>
                  <td>{s.owned}</td>
                  <td>${s.pricePer.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No stocks purchased yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="profit-banner">Yesterday's profit: $10.26</div>

        <div className="winner-banner">
          <div className="banner-bar top-bar"></div>
          <div className="banner-message">
            <div
              className="scroll-container"
              aria-label="Scrolling winner announcement"
            >
              <div
                className="scroll-text"
                data-text="Yesterday’s winner will be announced here."
              >
                Yesterday’s winner will be announced here.
              </div>
            </div>
          </div>
          <div className="banner-bar bottom-bar"></div>
        </div>
      </main>
    </div>
  );
}
