// ================================
// Expense Tracker - Page 1
// ================================

// LocalStorage Keys
const MONTHLY_KEY = "expenseTracker_monthlyExpenses";
const EXTRA_KEY = "expenseTracker_extraExpenses";

// ================================
// DOM Elements
// ================================

const monthlyInputs = document.querySelectorAll(".monthly-input");

const dateInput = document.getElementById("expenseDate");
const amountInput = document.getElementById("extraAmount");
const noteInput = document.getElementById("expenseNote");

const addExtraBtn = document.getElementById("addExtraExpense");
const recentExpensesList = document.getElementById("recentExpensesList");

const totalMonthlyEl = document.getElementById("totalMonthly");
const totalExtraEl = document.getElementById("totalExtra");
const overallExpensesEl = document.getElementById("overallExpenses");

const dashboardBtn = document.getElementById("dashboardBtn");

// ================================
// Load Data
// ================================

let monthlyExpenses = JSON.parse(
    localStorage.getItem(MONTHLY_KEY)
) || {
    Food: 0,
    Transportation: 0,
    Rent: 0,
    Groceries: 0,
    Internet: 0,
    Gas: 0
};

let extraExpenses = JSON.parse(
    localStorage.getItem(EXTRA_KEY)
) || [];

// ================================
// Set Today's Date
// ================================

if (dateInput) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

// ================================
// Load Monthly Values
// ================================

monthlyInputs.forEach((input) => {
    const category = input.dataset.category;

    if (category && monthlyExpenses[category] !== undefined) {
        input.value =
            monthlyExpenses[category] === 0
                ? ""
                : monthlyExpenses[category];
    }
});

// ================================
// Monthly Expense Input
// ================================

monthlyInputs.forEach((input) => {
    input.addEventListener("input", () => {
        const category = input.dataset.category;

        let value = parseFloat(input.value);

        if (isNaN(value) || value < 0) {
            value = 0;
        }

        monthlyExpenses[category] = value;

        localStorage.setItem(
            MONTHLY_KEY,
            JSON.stringify(monthlyExpenses)
        );

        updateSummary();
    });
});

// ================================
// Add Extra Expense
// ================================

if (addExtraBtn) {
    addExtraBtn.addEventListener("click", () => {
        const date = dateInput.value;
        const amount = parseFloat(amountInput.value);
        const note = noteInput.value.trim();

        // Validation
        if (!date) {
            alert("Please select a date.");
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid expense amount.");
            return;
        }

        if (!note) {
            alert("Please enter an expense note.");
            return;
        }

        // Create expense object
        const newExpense = {
            id: Date.now(),
            date: date,
            amount: amount,
            note: note
        };

        // Add newest expense first
        extraExpenses.unshift(newExpense);

        // Save
        localStorage.setItem(
            EXTRA_KEY,
            JSON.stringify(extraExpenses)
        );

        // Clear inputs
        amountInput.value = "";
        noteInput.value = "";

        // Update UI
        renderExtraExpenses();
        updateSummary();
    });
}

// ================================
// Render Extra Expenses
// ================================

function renderExtraExpenses() {
    if (!recentExpensesList) return;

    recentExpensesList.innerHTML = "";

    if (extraExpenses.length === 0) {
        recentExpensesList.innerHTML = `
            <div class="empty-state">
                No extra expenses added yet.
            </div>
        `;

        return;
    }

    extraExpenses.forEach((expense) => {
        const expenseItem = document.createElement("div");

        expenseItem.className = "expense-item";

        expenseItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-note">
                    ${escapeHTML(expense.note)}
                </div>

                <div class="expense-date">
                    ${formatDate(expense.date)}
                </div>
            </div>

            <div class="expense-right">
                <div class="expense-amount">
                    ₹${Number(expense.amount).toFixed(2)}
                </div>

                <div class="expense-actions">
                    <button
                        class="edit-btn"
                        onclick="editExpense(${expense.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;

        recentExpensesList.appendChild(expenseItem);
    });
}

// ================================
// Edit Extra Expense
// ================================

function editExpense(id) {
    const expense = extraExpenses.find(
        (item) => item.id === id
    );

    if (!expense) return;

    dateInput.value = expense.date;
    amountInput.value = expense.amount;
    noteInput.value = expense.note;

    // Remove old expense
    extraExpenses = extraExpenses.filter(
        (item) => item.id !== id
    );

    localStorage.setItem(
        EXTRA_KEY,
        JSON.stringify(extraExpenses)
    );

    renderExtraExpenses();
    updateSummary();

    // Scroll to input section
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================================
// Delete Extra Expense
// ================================

function deleteExpense(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    extraExpenses = extraExpenses.filter(
        (item) => item.id !== id
    );

    localStorage.setItem(
        EXTRA_KEY,
        JSON.stringify(extraExpenses)
    );

    renderExtraExpenses();
    updateSummary();
}

// ================================
// Update Expense Summary
// ================================

function updateSummary() {
    // Monthly total
    const totalMonthly = Object.values(monthlyExpenses).reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    // Extra total
    const totalExtra = extraExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
    );

    // Overall
    const overall = totalMonthly + totalExtra;

    if (totalMonthlyEl) {
        totalMonthlyEl.textContent =
            `₹${totalMonthly.toFixed(2)}`;
    }

    if (totalExtraEl) {
        totalExtraEl.textContent =
            `₹${totalExtra.toFixed(2)}`;
    }

    if (overallExpensesEl) {
        overallExpensesEl.textContent =
            `₹${overall.toFixed(2)}`;
    }
}

// ================================
// Format Date
// ================================

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// ================================
// Escape HTML
// ================================

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================================
// DASHBOARD BUTTON
// ================================

if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
}

// ================================
// Initial Load
// ================================

renderExtraExpenses();
updateSummary();