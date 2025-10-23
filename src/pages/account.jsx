import React from "react";

export default function Account() {
  return (
    <div>
      <main>
        <h2 className="welcome-title">Hello, (Account Name)!</h2>
        <p className="unallocated-funds">Unallocated funds: $30.00</p>

        <form>
          <div>
            <input type="text" placeholder="Stock symbol to buy" />
            <button>Buy</button>
          </div>
          <p>
            Price: $0.00 - 1x <button>+</button> <button>-</button>
          </p>
        </form>

        <p className="allocated-funds">Allocated funds: $9970.00</p>

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
            <tr><td>GOOG</td><td>$9000.00</td><td>9</td><td>$1000.00</td></tr>
            <tr><td>AMD</td><td>$900.00</td><td>9</td><td>$100.00</td></tr>
            <tr><td>ACME</td><td>$70.00</td><td>7</td><td>$10.00</td></tr>
          </tbody>
        </table>

        <div className="profit-banner">Yesterday's profit: $10.26</div>

        <div className="winner-banner">
          <div className="banner-bar top-bar"></div>
            <div className="banner-message" id="winner-announcement">
              <div className="scroll-text">
                Yesterday’s winner will be announced here.
              </div>
            </div>
          <div className="banner-bar bottom-bar"></div>
        </div>
      </main>
    </div>
  );
}
