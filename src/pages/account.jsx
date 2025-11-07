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

  const formatCurrency = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // --- Fetch portfolio data for logged-in user ---
  React.useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch("/api/portfolio");
        if (response.status === 401) {
          setMessage("This message appears on critical failure.");
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

  // --- Fetch opening stock prices from backend ---
  React.useEffect(() => {
    async function fetchStockPrice(symbol) {
      if (!symbol.trim()) {
        setStockPrice(null);
        return;
      }

      try {
        // Ensure backend prices are up to date
        await fetch("/api/fetch-opening", { method: "POST" });

        // Get the latest prices stored in backend memory
        const response = await fetch("/api/opening-prices");
        const prices = await response.json();

        const upper = symbol.toUpperCase();
        const price = prices[upper];

        if (price) {
          setStockPrice(price);
        } else {
          setStockPrice(null);
        }
      } catch (err) {
        console.error("Error fetching stock price:", err);
        setStockPrice(null);
      }
    }

    fetchStockPrice(symbol);
  }, [symbol]);

  // --- Handle buying stocks ---
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

  // --- Quantity controls ---
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
            <button type="submit">Buy</button>
          </div>
          <p>
            Price:{" "}
            {stockPrice
              ? formatCurrency(stockPrice)
              : symbol
              ? "Fetching..."
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