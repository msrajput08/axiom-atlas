# AxiomAtlas Brain Lab — 18 cross-subject games and calculator verification

## Experience
- 9 subject hubs and 18 playable activities, two for each existing primary category.
- 5 independently seeded puzzle rounds per activity, unlimited free practice, a date-seeded daily run, optional hints, and local personal-best scores.
- Every submitted answer reveals a readable step-by-step explanation and a **canonical calculator link** with the exact input values a user can re-enter to verify the result. Incorrect answers emphasize the verification action.
- All games are browser-local. There is no sign-in, cloud save, shared leaderboard, monetary reward, artificial urgency or external question-generation service.
- Scores are stored in the browser's own `localStorage`; the existing privacy policy discloses this. Game questions and calculator inputs are not sent to a server.
- Links use existing calculator pages; canonical calculator URLs and numerical calculation engines are unchanged.

## Subject coverage

| Subject | Games | Calculator links |
| --- | --- | --- |
| Mathematics | Prime Detective, Percent Hunt | Prime Number Checker, Percentage Calculator |
| Algebra | Equation Escape, Quadratic Code | Linear Equation Calculator, Quadratic Equation Solver |
| Calculus & Graphing | Derivative Dash, Integral Hunt | Derivative Calculator, Definite Integral Calculator |
| Geometry & Trigonometry | Slope Run, Shape Builder | Slope Calculator, 2D Geometry Calculator |
| Physics & Engineering | Energy Quest, Circuit Lab | Kinetic Energy Calculator, Circuit Calculator |
| Statistics & Probability | Mean Machine, Probability Lab | Statistics Calculator, Basic Probability Calculator |
| Finance | Interest Builder, Margin Master | Simple Interest mode, Profit Margin Calculator |
| Converters & Everyday Tools | Attendance Rescue, Recipe Remix | Attendance Planner, Recipe Scaling Calculator |
| Astronomy & Astrophysics | Solar Scale, Star Distance | Solar Radius Converter, Stellar Parallax Calculator |

## URLs and discoverability

`/games/` is a crawlable hub with two HTML cards per category. Each game has a unique crawlable route at `/games/<game-id>/` with a descriptive heading, contextual information and WebApplication/BreadcrumbList metadata. All 19 game routes are in sitemap.xml alongside the 326 existing canonical URLs. The homepage, primary category pages, sidebar, and the linked calculators provide contextual internal links to the games.

A new game should only be added if it has a distinct educational purpose, independent numerical tests, an existing compatible calculator link and a real worked explanation. Do not add 100 near-identical pages to target keywords.

## Accuracy, limitations, and QA

The central module `site/assets/games-engine.mjs` uses deterministic seeded randomness and known formulas. The test suite `tests/brain_games.test.mjs` independently recomputes 150 questions per game (2,700 total), validates answer grading, all 18 calculator link mappings, all 9 category groupings and game HTML. Errors are explained; the displayed answer is the intended result, not a formally certified solution.

Some games deliberately use simplified educational models:
- Simple interest instead of compounding, and gross profit margin instead of markup
- Classical non-relativistic kinetic energy and ideal Ohm's law
- Equal-probability spinner sectors
- The exact IAU nominal solar radius and elementary stellar parallax geometry
- Simple power-rule derivatives and definite integrals over positive intervals

The engine does not automatically prefill existing calculators: the verification panel shows the input names and values to enter manually. Scores are local and can reset with browser storage. Date-based daily puzzles follow the user's device date and cannot support a secure global ranking.

## Measurement
Track page-level game discoverability, first-game starts, completed five-round runs, return visits, link clicks back to calculators, and device-specific usability **without** sending answer values to analytics. Before adding more activities, verify mobile gameplay and user interest. Adding new URLs alone does not guarantee search rankings or traffic.
