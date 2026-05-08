# Requirements Clarification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match your needs, choose the last option (Other) and describe your preference.
Let me know when you're done.

---

## Question 1: Data Source Strategy
Zillow does not offer a public API for property listings. How should the application retrieve property data?

A) Scrape Zillow directly (web scraping — note: may violate Zillow's ToS)
B) Use a third-party real estate data API (e.g., RapidAPI Zillow wrapper, Rentcast, Redfin, Realtor.com API)
C) Use Zillow's official partner API (requires Zillow partnership/approval)
D) Allow the user to configure their own API key for a supported data provider
E) Other (please describe after [Answer]: tag below)

[Answer]: A,B

---

## Question 2: Rental Rate Data Source
Where should rental rate data come from for comparison?

A) Same data source as property listings (if it includes rental data)
B) A separate rental-focused API (e.g., Rentcast, Rent.com, Zillow Rent Zestimate)
C) User-provided rental data (manual input or CSV upload)
D) Aggregate from multiple sources
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 3: Cost of Living Data
How should cost of living data be sourced?

A) Use a public cost-of-living API (e.g., Numbeo, BestPlaces, Teleport)
B) Use static/embedded cost-of-living datasets (e.g., BLS, Census data)
C) Allow user to manually input cost-of-living factors
D) Exclude cost of living from MVP; focus on property vs. rental comparison only
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: ROI Calculation Model
What factors should be included in the ROI ranking formula?

A) Simple cap rate only: (Annual Rent - Expenses) / Property Price
B) Cap rate + cost of living adjustment
C) Full ROI model: cap rate + cost of living + estimated vacancy rate + property tax + maintenance estimate
D) Let the user configure which factors to include/weight
E) Other (please describe after [Answer]: tag below)

[Answer]: C,D

---

## Question 5: Search Scope
How should users define the search area?

A) ZIP code only
B) City/region name only
C) Both ZIP code and city/region (user's choice)
D) Radius search from a center point (lat/lng or address)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6: Comparison Filters
Which property attributes should be used for comparison/filtering?

A) Bedrooms and square footage only
B) Bedrooms, bathrooms, square footage
C) Bedrooms, bathrooms, square footage, property type (SFH, condo, multi-family), year built
D) All of the above plus user-configurable custom filters
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 7: Results Display
How should results be presented to the user?

A) Sortable table/list ranked by ROI score
B) Table + map view showing property locations
C) Table + charts (ROI comparison charts, rental yield graphs)
D) Full dashboard with table, map, and charts
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 8: User Authentication
Does the application need user accounts or authentication?

A) No authentication — fully public, anyone can use it
B) Simple authentication (email/password) to save searches and favorites
C) OAuth login (Google, GitHub) to save searches
D) No auth for MVP, but design to support it later
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 9: Data Persistence
Should the application save any data?

A) No persistence — all data fetched live on each search
B) Cache API results in a database to reduce API calls and improve speed
C) Allow users to save/bookmark properties and searches
D) Both caching and user-saved searches
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 10: Deployment Target
Where will this application be deployed?

A) Local development only (no deployment needed)
B) Self-hosted on a VPS or on-premises server
C) Cloud platform (AWS, GCP, Azure)
D) Containerized (Docker/Kubernetes)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 11: Tech Stack Preferences
Any preferences for the Node.js stack?

A) Express.js backend + plain HTML/CSS/JS frontend
B) Express.js backend + React frontend
C) Express.js backend + Vue.js frontend
D) Fastify or Hapi backend + any frontend framework
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
