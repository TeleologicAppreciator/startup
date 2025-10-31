import React from "react";

export default function Account() {
  const [funds, setFunds] = React.useState(10000);
  const [stocks, setStocks] = React.useState([]);
  const [symbol, setSymbol] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [yesterdayProfit, setYesterdayProfit] = React.useState(0);
  const [stockPrice, setStockPrice] = React.useState(null);

  const userEmail = localStorage.getItem("userEmail");

  const fundsKey = `funds_${userEmail || "guest"}`;
  const stocksKey = `stocks_${userEmail || "guest"}`;
  const profitKey = `profit_${userEmail || "guest"}`;

  const formatCurrency = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  React.useEffect(() => {
    const savedFunds = localStorage.getItem(fundsKey);
    const savedStocks = localStorage.getItem(stocksKey);
    const savedProfit = localStorage.getItem(profitKey);

    if (savedFunds) setFunds(parseFloat(savedFunds));
    if (savedStocks) setStocks(JSON.parse(savedStocks));
    if (savedProfit) setYesterdayProfit(parseFloat(savedProfit));
    else {
      const randomProfit = +(Math.random() * 50 - 10).toFixed(2);
      setYesterdayProfit(randomProfit);
      localStorage.setItem(profitKey, randomProfit.toString());
    }
  }, [fundsKey, stocksKey, profitKey]);

  React.useEffect(() => {
    localStorage.setItem(fundsKey, funds.toString());
    localStorage.setItem(stocksKey, JSON.stringify(stocks));
  }, [funds, stocks, fundsKey, stocksKey]);

  React.useEffect(() => {
    async function fetchStockPrice(symbol) {
      if (!symbol.trim()) {
        setStockPrice(null);
        return;
      }
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/quote-short/${symbol.toUpperCase()}?apikey=demo`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setStockPrice(data[0].price);
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

  function handleBuy(e) {
    e.preventDefault();

    if (!symbol.trim()) {
      alert("Please enter a stock symbol before buying.");
      return;
    }

    const priceToUse = stockPrice || 100;
    const cost = priceToUse * quantity;

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
              totalCost: (s.owned + quantity) * priceToUse,
              pricePer: priceToUse,
            }
          : s
      );
    } else {
      updatedStocks = [
        ...stocks,
        {
          symbol: symbol.toUpperCase(),
          owned: quantity,
          pricePer: priceToUse,
          totalCost: quantity * priceToUse,
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
      <header>
        <h1>🏁 StockSprint</h1>
        <p className="date-time">{new Date().toLocaleString()}</p>
      </header>

      <main>
        <h2 className="welcome-title">Hello, {userEmail || "Trader"}!</h2>
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
                  <td>{s.owned}</td>
                  <td>{formatCurrency(s.pricePer)}</td>
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