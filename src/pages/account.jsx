import React from "react";

export default function Account() {
  const [funds, setFunds] = React.useState(0);
  const [stocks, setStocks] = React.useState([]);
  const [symbol, setSymbol] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [stockPrice, setStockPrice] = React.useState(null);
  const [yesterdayProfit, setYesterdayProfit] = React.useState(0);
  const [message, setMessage] = React.useState("");

  const userEmail = localStorage.getItem("userEmail");
  const API_KEY = "4072f6f3409f4392a2cdeaa60bc5b4f8";

  const formatCurrency = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  React.useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch("/api/portfolio", {
          credentials: "include",
        });
        if (response.status === 401) {
          setMessage("Please log in to view your portfolio.");
          return;
        }
        const data = await response.json();
        setFunds(data.funds);
        setStocks(data.holdings || []);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      }
    }
    fetchPortfolio();
  }, []);

  async function previewPrice() {
    if (!symbol.trim()) {
      alert("Please enter a stock symbol.");
      return;
    }

    setStockPrice("loading");

    try {
      const url = `https://api.twelvedata.com/quote?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.close) {
        setStockPrice(parseFloat(data.close));
      } else {
        alert("Could not fetch stock price.");
        setStockPrice(null);
      }
    } catch (err) {
      console.error("Preview price error:", err);
      alert("Error fetching stock price");
      setStockPrice(null);
    }
  }

  async function handleBuy(e) {
    e.preventDefault();

    if (!symbol.trim()) {
      alert("Please enter a stock symbol before buying.");
      return;
    }

    if (!stockPrice) {
      alert("Could not fetch stock price.");
      return;
    }

    try {
      const response = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity,
          price: stockPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg || "Error buying stock");
        return;
      }

      setMessage(data.msg);
      setFunds(data.portfolio.funds);
      setStocks(data.portfolio.holdings);
      setSymbol("");
      setQuantity(1);
    } catch (err) {
      console.error("Error buying stock:", err);
    }
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
        <h1>Welcome to StockSprint</h1>
        <h2 className="welcome-title">Hello, {userEmail || "Trader"}!</h2>

        {message && <p style={{ color: "green" }}>{message}</p>}

        <p className="unallocated-funds">
          Unallocated funds: {formatCurrency(funds)}
        </p>

        <form onSubmit={handleBuy}>
          <div>
            <input
              type="text"
              placeholder="Stock symbol to buy"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />

            <button type="button" onClick={previewPrice}>
              Preview Price
            </button>

            <button type="submit">Buy</button>
          </div>

          <p>
            Price:{" "}
            {stockPrice === "loading"
              ? "Loading..."
              : stockPrice
              ? formatCurrency(stockPrice)
              : "—"}{" "}
            × {quantity}
            <span className="qty-buttons">
              <button type="button" onClick={increaseQuantity}>
                +
              </button>
              <button type="button" onClick={decreaseQuantity}>
                -
              </button>
            </span>
          </p>
        </form>

        <p className="allocated-funds">
          Allocated funds: {formatCurrency(totalAllocated)}
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
                  <td>{formatCurrency(s.totalCost)}</td>
                  <td>{s.quantity}</td>
                  <td>{formatCurrency(s.buyPrice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No stocks purchased yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="profit-banner">
          Yesterday's profit: {formatCurrency(yesterdayProfit)}
        </div>

        <p className="date-time">{new Date().toLocaleString()}</p>
      </main>
    </div>
  );
}