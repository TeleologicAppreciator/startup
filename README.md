# Stock Sprint

[My Notes](notes.md)

Stock Sprint is an app where each day users get fake currency and compete to see who can make the most money off of the stock market in a day.


> [!NOTE]
>  This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
>  If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

## 🚀 Specification Deliverable

> [!NOTE]
>  Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Have you ever wanted to test your stock market intuition? At Stock Sprint, every day users receive fake currency to invest in stocks at the market’s opening price and automatically sell at the end of the day. Compete with other participants and climb the leaderboard to see who has the best market instincts.

### Design

![Design image](concept.png)

### Key features

- Secure login over HTTPS
- Look up opening market stock prices
- Daily leaderboard and all time leaderboard

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Uses correct HTML structure with two pages: one for login, and one for the overview.
- **CSS** - Responsive application styling that looks good on different screen sizes. Uses good whitespace, color choice, and contrast.
- **React** - Single-page application with components for login, buying stocks, leaderboard display, and backend calls. Reacts dynamically to user actions.
- **Service** - Backend service with endpoints for:
                - Login
                - Buying stocks
                - Updating leaderboard
- **DB/Login** - Stores users, stock purchases, and leaderboard data.
- **WebSocket** - Sends real-time notifications to connected clients when the daily leaderboard updates.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://stocksprint.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **HTML pages** - I did not complete this part of the deliverable.
- [X] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [X] **Links** - I did not complete this part of the deliverable.
- [X] **Text** - I did not complete this part of the deliverable.
- [X] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [X] **Images** - I did not complete this part of the deliverable.
- [X] **Login placeholder** - I did not complete this part of the deliverable.
- [X] **DB data placeholder** - I did not complete this part of the deliverable.
- [X] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Header, footer, and main content body** - Stylized header with background color, fixed positioning, and internal layout using flexbox. Footer includes spacing, colors, and github link. Main content structured using flexbox.
- [X] **Navigation elements** - Consistent navigation bar with stylized links, active state, horizontal scroll support for smaller screens, and responsive font sizing using clamp().
- [X] **Responsive to window resizing** - Implemented responsive design using flexbox and relative units like % and clamp(). Included a viewport meta tag for mobile support. Used media queries to adjust layout for smaller viewports.
- [X] **Application elements** - Styled login form, buy form, leaderboard table, and profit banner using CSS with clean alignment, inline-block banners, shadows, and border accents.
- [X] **Application text content** - Styled text elements like the app description, "Welcome" header, and profit summary using typography, color, padding, and layout. Emphasis on clean, readable presentation.
- [X] **Application images** - Applied responsive styles to floating images, including max-width: 100%, float, and media queries for layout adjustments on smaller screens.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite** - I deployed my project using Vite. The development environment runs correctly, and the app is structured according to Vite’s file layout.
- [x] **Components** - I created React components for each page (Login, Account, Leaderboard, About) using JSX and shared styling.
- [x] **Router** - I implemented React Router to allow single-page navigation between my components without full page reloads.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **All functionality implemented or mocked out** - I implemented all core functionality of the Stock Sprint app using React state and localStorage to simulate a backend service. The leaderboard currently runs on a mocked backend that updates in real time to emulate daily trading results. The structure is already in place to connect to a real database in the future, with data persistence, sorting logic, and update cycles handled in a way that will integrate cleanly with API endpoints. User account data and stock transactions are also locally persisted to mirror the behavior of a live backend.
- [X] **Hooks** - React’s useState and useEffect hooks are used throughout to handle state updates and data persistence. Components automatically re-render when state changes. For example, account balances update instantly when stocks are bought, and leaderboard values refresh on a timed cycle. The hooks are also designed to make it easy to switch to fetching and storing data through API calls once a backend is connected.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Node.js/Express HTTP service** - I created a backend service using Node.js and Express, located in the /service directory. The service handles API routes for user authentication, leaderboard access, and stock trading actions. It runs on port 4000 as required and uses cookie-parser, bcryptjs, and uuid for authentication management.
- [X] **Static middleware for frontend** - I configured Express to serve my built frontend using express.static("public"), with a React router fallback that delivers index.html for any unknown route. This ensures the deployed site works for all direct links (like /account or /leaderboard).
- [X] **Calls to third party endpoints** - My frontend fetches live stock data from the Financial Modeling Prep (FMP) API. It retrieves real-time prices for symbols such as AAPL, TSLA, and AMZN, integrating that data directly into the trading interface so users see current stock values.
- [X] **Backend service endpoints** - I implemented multiple backend endpoints for StockSprint including /api/register, /api/login, /api/logout, /api/buy, /api/portfolio, and /api/leaderboard. These endpoints manage user data, perform stock transactions, and provide daily results. The backend also includes endpoints to fetch and update opening and closing prices for the trading session. I added additional functionality for daily trading cycles, including profit updates and summary data to make the simulation more complete.
- [X] **Frontend calls service endpoints** - The React frontend communicates with my backend through fetch requests. For example, buying stocks triggers /api/buy, and user portfolios are retrieved via /api/portfolio. Authentication and leaderboard data are also fetched from the backend in real time. The frontend also makes calls to daily summary and profit update routes for displaying end-of-day results.
- [X] **Supports registration, login, logout, and restricted endpoint** - I added cookie-based authentication. New users can register and log in securely, and protected routes such as /api/portfolio require a valid session token. The app also supports logging out, which clears the session cookie and restricts further access to private data. This backend structure mirrors a full authentication system and lays the groundwork for connecting to a database in the next deliverable.



## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
