import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} from "./service/expenseService.js";

import {
  validateExpense
} from "../exception/validationException.js";


if (!localStorage.user) {
  location = "login.html";
}


const $ = (id) =>
  document.getElementById(id);

const form = $("expenseForm");
const list = $("expenses");
const error = $("error");

let expenses = [];

const currentUser = JSON.parse(
  localStorage.getItem("user") || "null"
);


const money = (value) => {

  return `₹${Number(value)
    .toLocaleString("en-IN")}`;
};

const limitKey = currentUser ? `expenseLimit:${currentUser.id}` : 'expenseLimit';
const lockKey = `${limitKey}:locked`;


function render() {

  const search =
    $("search").value.toLowerCase();

  const category =
    $("filterCategory").value;

  const date =
    $("filterDate").value;

  const dateFrom =
    $("filterDateFrom").value;

  const dateTo =
    $("filterDateTo").value;

  if (dateFrom && dateTo && dateFrom > dateTo) {
    error.textContent =
      "The start date must be before or equal to the end date.";
  } else {
    error.textContent = "";
  }

  const shown =
    expenses.filter((item) => {

      const text =
        `${item.title} ${item.description}`
          .toLowerCase();

      return (
        text.includes(search) &&
        (!category ||
          item.category === category) &&
        (!date || item.date === date) &&
        (!dateFrom || item.date >= dateFrom) &&
        (!dateTo || item.date <= dateTo)
      );
    });


  list.innerHTML = shown.map(
    (item) => {

      return `
        <article class="expense">

          <div>
            <b>${item.title}</b>
            — ${money(item.amount)}
            <br>

            <small>
              ${item.category}
              • ${item.date}
              ${item.description
                ? ` • ${item.description}`
                : ""}
            </small>
          </div>

          <div class="actions">

            <button
              data-action="edit"
              data-id="${item.id}">
              Edit
            </button>

            <button
              class="delete"
              data-action="delete"
              data-id="${item.id}">
              Delete
            </button>

          </div>

        </article>
      `;
    }
  ).join("");

  showDashboard();
}


function showDashboard() {

  const categories = [
    "Academic",
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Other"
  ];


  const total =
    expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    );


  const cards = [
    ["Total Expense", total]
  ];


  categories.forEach(
    (category) => {

      const total =
        expenses
          .filter(
            (item) =>
              item.category === category
          )
          .reduce(
            (sum, item) =>
              sum + Number(item.amount),
            0
          );

      cards.push([
        category,
        total
      ]);
    }
  );


  $("dashboard").innerHTML =
    cards.map(
      (card) => `
        <div class="card">
          ${card[0]}
          <b>${money(card[1])}</b>
        </div>
      `
    ).join("");
}


async function load() {

  if (!currentUser) {
    return;
  }

  try {

    expenses =
      await getExpenses(currentUser.id) || [];

    render();

    const alert = document.getElementById('limitAlert');
    if (localStorage.getItem(lockKey)) {
      if (alert) alert.textContent = 'Maximum limit exceeded — set a new limit on Overview to continue.';
    } else {
      if (alert) alert.textContent = '';
    }

  } catch (err) {

    error.textContent =
      err.message;
  }
}


form.onsubmit = async (event) => {

  event.preventDefault();

  if (!currentUser) {
    return;
  }

  // prevent adding when user has exceeded limit and not reset it
  if (localStorage.getItem(lockKey)) {
    error.textContent = 'Maximum limit exceeded. Set a new limit from the Overview before adding more expenses.';
    // also show a persistent alert on this page
    const alert = document.getElementById('limitAlert');
    if (alert) {
      alert.textContent = 'Maximum limit exceeded — please set a new spending limit on the Overview to continue.';
    }
    return;
  }

  try {

    const data = {
      title: $("title").value,
      amount: $("amount").value,
      category: $("category").value,
      date: $("date").value,
      description: $("description").value,
      user: currentUser.id
    };


    validateExpense(data);

    await addExpense(data);

    form.reset();

    load();

  } catch (err) {

    error.textContent =
      err.message;
  }
};


async function removeExpense(id) {

  try {

    await deleteExpense(id);

    await load();

  } catch (err) {

    error.textContent =
      err.message;
  }
}


async function editExpense(id) {

  const item =
    expenses.find(
      (expense) =>
        String(expense.id) === id
    );

  if (!item) {
    error.textContent =
      "The selected expense could not be found.";
    return;
  }

  const title =
    prompt(
      "Title",
      item.title
    );

  const amount =
    prompt(
      "Amount",
      item.amount
    );


  if (!title || !amount) {
    return;
  }


  try {

    await updateExpense(
      id,
      {
        ...item,
        title,
        amount
      }
    );

    await load();

  } catch (err) {

    error.textContent =
      err.message;
  }
}


list.addEventListener("click", (event) => {

  const button =
    event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const id =
    button.dataset.id;

  if (button.dataset.action === "edit") {
    editExpense(id);
  } else if (button.dataset.action === "delete") {
    removeExpense(id);
  }
});


[
  "search",
  "filterCategory",
  "filterDate",
  "filterDateFrom",
  "filterDateTo"
].forEach(
  (id) => {

    $(id).oninput =
      render;
  }
);


$("logout").onclick = () => {

  localStorage.removeItem(
    "user"
  );

  location = "login.html";
};


load();
