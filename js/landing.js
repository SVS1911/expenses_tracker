import { getExpenses } from "./service/expenseService.js";

if (!localStorage.user) {
  location = "login.html";
}

const $ = (id) => document.getElementById(id);
const currentUser = JSON.parse(localStorage.getItem("user") || "null");
const limitKey = currentUser
  ? `expenseLimit:${currentUser.id}`
  : "expenseLimit";

const money = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

const lockKey = `${limitKey}:locked`;

function render(expenses) {
  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const limit = Number(localStorage.getItem(limitKey) || 0);
  const recent = [...expenses]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 4);

  $("totalSpent").textContent = money(total);
  $("expenseCount").textContent = expenses.length;
  $("limitAmount").textContent = limit ? money(limit) : "Not set";
  $("budgetProgress").style.width = limit
    ? `${Math.min((total / limit) * 100, 100)}%`
    : "0%";

  if (limit) {
    const remaining = limit - total;
    $("budgetMessage").textContent = remaining >= 0
      ? `${money(remaining)} left in your spending limit.`
      : `${money(Math.abs(remaining))} over your spending limit.`;
    $("budgetProgress").classList.toggle("over-limit", remaining < 0);

    // When limit is exceeded, lock additions until the user sets a new limit
    if (remaining < 0) {
      localStorage.setItem(lockKey, "1");
      const add = document.querySelector('.add-expense-button');
      if (add) {
        add.removeAttribute('href');
        add.classList.add('disabled');
        add.setAttribute('aria-disabled', 'true');
      }
      const notice = $("limitNotice");
      if (notice) {
        notice.textContent = 'Maximum limit exceeded — set a new limit to continue adding expenses.';
      }
    } else {
      localStorage.removeItem(lockKey);
      const add = document.querySelector('.add-expense-button');
      if (add && !add.getAttribute('href')) {
        add.setAttribute('href', 'index.html');
        add.classList.remove('disabled');
        add.removeAttribute('aria-disabled');
      }
      const notice = $("limitNotice");
      if (notice) {
        notice.textContent = '';
      }
    }

  } else {
    $("budgetMessage").textContent =
      "Choose a limit to start tracking your pace.";
  }

  $("recentExpenses").innerHTML = recent.map((item) => `
    <article class="recent-item">
      <div class="recent-icon">${item.category.charAt(0)}</div>
      <div class="recent-details">
        <b>${item.title}</b>
        <small>${item.category} · ${item.date}</small>
      </div>
      <strong>${money(item.amount)}</strong>
    </article>
  `).join("");
  $("emptyState").hidden = recent.length > 0;
}

async function load() {
  if (!currentUser) return;

  try {
    const expenses = await getExpenses(currentUser.id) || [];
    $("welcome").textContent = `Good to see you, ${currentUser.name.split(" ")[0]}.`;
    render(expenses);
  } catch (err) {
    $("error").textContent = err.message;
  }
}

$("editLimit").onclick = () => {
  const currentLimit = localStorage.getItem(limitKey) || "";
  const value = prompt("Set your spending limit", currentLimit);

  if (value === null) return;

  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) {
    $("error").textContent = "Please enter a spending limit greater than zero.";
    return;
  }

  localStorage.setItem(limitKey, limit);
  // removing lock when user actively resets the limit
  localStorage.removeItem(lockKey);
  load();
};

$("logout").onclick = () => {
  localStorage.removeItem("user");
  location = "login.html";
};

load();
