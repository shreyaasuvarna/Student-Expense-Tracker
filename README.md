# Student Expense Tracker

A responsive, mobile-first web application that helps students track their daily expenses, set monthly budgets, and visualize spending patterns — built with pure HTML5, CSS3, and  JavaScript.


*Built as part of the **DecodeLabs Full Stack Internship Program** — Batch 2026 · Project 1*


---
##   Features

- **Budget Setup** — Set a monthly budget via a modal dialog; persists across sessions
- **Add Expenses** — Log expenses with title, amount, date, and category
- **6 Categories** — Food 🍽️ · Travel 🚌 · Books 📚 · Fun 🎮 · Health 💊 · Other 📦
- **SVG Donut Chart** — Visual breakdown of spending by category 
- **Budget Progress Bar** — Colour-coded bar that warns at 80% (yellow) and 100% (red)
- **Expense History** — Sortable list with category filter and delete per item
- **Clear All** — Reset all expenses with one click
- **LocalStorage Persistence** — All data saved in the browser; survives page refresh
- **Form Validation** — Inline error messages for empty or invalid inputs
- **Toast Notifications** — Feedback on every action (add, delete, budget set)
- **Over-Budget Alert** — Automatic warning when spending exceeds the set budget

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Structure  | HTML5 (Semantic landmarks)        |
| Styling    | CSS3 (Grid, Flexbox, CSS Variables)|
| Logic      |  JavaScript                       |
| Storage    | localStorage API                  |
| Charts     | Pure SVG (no external libraries)  |
| Fonts      | Google Fonts — Inter + Roboto     |


---

## Responsive Breakpoints

| Device  | Breakpoint | Layout                        |
|---------|------------|-------------------------------|
| Mobile  | Default    | Single column, stacked cards  |
| Tablet  | `768px`    | 3-column summary, 2-col grid  |
| Desktop | `1024px`   | Full layout, larger donut     |

---

##  File Structure

```
Student-Expense-Tracker/
├── index.html   # Semantic HTML structure
├── style.css    # All styling & responsive rules
└── app.js       # All logic, data, DOM manipulation
```
