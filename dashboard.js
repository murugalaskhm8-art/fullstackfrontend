/* =========================================
   STORAGE KEYS
========================================= */

const MONTHLY_STORAGE_KEY =
  "expenseTracker_monthlyExpenses";

const EXTRA_STORAGE_KEY =
  "expenseTracker_extraExpenses";


/* =========================================
   CATEGORY CONFIGURATION
========================================= */

const categories = [
  {
    key: "food",
    name: "Food"
  },
  {
    key: "transportation",
    name: "Transportation"
  },
  {
    key: "rent",
    name: "Rent"
  },
  {
    key: "groceries",
    name: "Groceries"
  },
  {
    key: "internet",
    name: "Internet"
  },
  {
    key: "gas",
    name: "Gas"
  }
];


/* =========================================
   DOM ELEMENTS
========================================= */

const monthlyTotalElement =
  document.getElementById("monthlyTotal");

const extraTotalElement =
  document.getElementById("extraTotal");

const overallTotalElement =
  document.getElementById("overallTotal");

const highestCategoryElement =
  document.getElementById("highestCategory");

const highestAmountElement =
  document.getElementById("highestAmount");

const categoryList =
  document.getElementById("categoryList");

const distributionList =
  document.getElementById("distributionList");

const recentExpenses =
  document.getElementById("recentExpenses");

const chartTotal =
  document.getElementById("chartTotal");

const chartMonthly =
  document.getElementById("chartMonthly");

const chartExtra =
  document.getElementById("chartExtra");

const emptyDashboard =
  document.getElementById("dashboardEmpty");


/* =========================================
   LOAD DATA
========================================= */

function loadMonthlyExpenses() {

  const saved =
    localStorage.getItem(
      MONTHLY_STORAGE_KEY
    );


  if (!saved) {

    return {
      food: 0,
      transportation: 0,
      rent: 0,
      groceries: 0,
      internet: 0,
      gas: 0
    };
  }


  try {

    const data =
      JSON.parse(saved);


    return {

      food: getSafeNumber(data.food),

      transportation:
        getSafeNumber(
          data.transportation
        ),

      rent:
        getSafeNumber(data.rent),

      groceries:
        getSafeNumber(
          data.groceries
        ),

      internet:
        getSafeNumber(
          data.internet
        ),

      gas:
        getSafeNumber(data.gas)

    };

  } catch (error) {

    console.error(
      "Unable to read monthly expenses:",
      error
    );


    return {
      food: 0,
      transportation: 0,
      rent: 0,
      groceries: 0,
      internet: 0,
      gas: 0
    };
  }
}


/* =========================================
   LOAD EXTRA EXPENSES
========================================= */

function loadExtraExpenses() {

  const saved =
    localStorage.getItem(
      EXTRA_STORAGE_KEY
    );


  if (!saved) {
    return [];
  }


  try {

    const data =
      JSON.parse(saved);


    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    console.error(
      "Unable to read extra expenses:",
      error
    );

    return [];
  }
}


/* =========================================
   SAFE NUMBER
========================================= */

function getSafeNumber(value) {

  const number =
    Number(value);


  if (
    Number.isFinite(number) &&
    number >= 0
  ) {

    return number;
  }


  return 0;
}


/* =========================================
   CURRENCY
========================================= */

function formatCurrency(amount) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }
  ).format(amount);
}


/* =========================================
   DATE
========================================= */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  if (Number.isNaN(date.getTime())) {
    return dateString;
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


/* =========================================
   CALCULATE MONTHLY TOTAL
========================================= */

function calculateMonthlyTotal(
  monthlyExpenses
) {

  return categories.reduce(
    (total, category) => {

      return (
        total +
        getSafeNumber(
          monthlyExpenses[
            category.key
          ]
        )
      );

    },
    0
  );
}


/* =========================================
   CALCULATE EXTRA TOTAL
========================================= */

function calculateExtraTotal(
  extraExpenses
) {

  return extraExpenses.reduce(
    (total, expense) => {

      return (
        total +
        getSafeNumber(
          expense.amount
        )
      );

    },
    0
  );
}


/* =========================================
   SUMMARY
========================================= */

function renderSummary(
  monthlyExpenses,
  extraExpenses
) {

  const monthlyTotal =
    calculateMonthlyTotal(
      monthlyExpenses
    );


  const extraTotal =
    calculateExtraTotal(
      extraExpenses
    );


  const overallTotal =
    monthlyTotal +
    extraTotal;


  monthlyTotalElement.textContent =
    formatCurrency(
      monthlyTotal
    );


  extraTotalElement.textContent =
    formatCurrency(
      extraTotal
    );


  overallTotalElement.textContent =
    formatCurrency(
      overallTotal
    );


  chartTotal.textContent =
    formatCurrency(
      overallTotal
    );


  chartMonthly.textContent =
    formatCurrency(
      monthlyTotal
    );


  chartExtra.textContent =
    formatCurrency(
      extraTotal
    );


  renderHighestCategory(
    monthlyExpenses
  );
}


/* =========================================
   HIGHEST CATEGORY
========================================= */

function renderHighestCategory(
  monthlyExpenses
) {

  let highestCategory = null;

  let highestAmount = 0;


  categories.forEach(
    (category) => {

      const amount =
        getSafeNumber(
          monthlyExpenses[
            category.key
          ]
        );


      if (
        amount > highestAmount
      ) {

        highestAmount =
          amount;

        highestCategory =
          category.name;
      }

    }
  );


  if (!highestCategory) {

    highestCategoryElement.textContent =
      "No data";

    highestAmountElement.textContent =
      "₹0";

    return;
  }


  highestCategoryElement.textContent =
    highestCategory;


  highestAmountElement.textContent =
    formatCurrency(
      highestAmount
    );
}


/* =========================================
   CATEGORY BREAKDOWN
========================================= */

function renderCategoryBreakdown(
  monthlyExpenses
) {

  categoryList.innerHTML = "";


  const monthlyTotal =
    calculateMonthlyTotal(
      monthlyExpenses
    );


  categories.forEach(
    (category) => {

      const amount =
        getSafeNumber(
          monthlyExpenses[
            category.key
          ]
        );


      let percentage = 0;


      if (
        monthlyTotal > 0
      ) {

        percentage =
          (amount /
            monthlyTotal) *
          100;
      }


      const row =
        document.createElement(
          "div"
        );

      row.className =
        "category-row";


      row.innerHTML = `

        <div class="category-name">
          ${category.name}
        </div>

        <div class="category-bar">
          <div
            class="category-fill"
            style="width: ${percentage}%"
          ></div>
        </div>

        <div class="category-amount">
          ${formatCurrency(amount)}
        </div>

      `;


      categoryList.appendChild(
        row
      );

    }
  );
}


/* =========================================
   DISTRIBUTION
========================================= */

function renderDistribution(
  monthlyExpenses
) {

  distributionList.innerHTML = "";


  const monthlyTotal =
    calculateMonthlyTotal(
      monthlyExpenses
    );


  categories.forEach(
    (category) => {

      const amount =
        getSafeNumber(
          monthlyExpenses[
            category.key
          ]
        );


      const percentage =
        monthlyTotal > 0
          ? (amount /
              monthlyTotal) *
            100
          : 0;


      const item =
        document.createElement(
          "div"
        );

      item.className =
        "distribution-item";


      item.innerHTML = `

        <div class="distribution-top">

          <span>
            ${category.name}
          </span>

          <span>
            ${percentage.toFixed(1)}%
          </span>

        </div>

        <div class="distribution-bar">

          <div
            class="distribution-fill"
            style="width: ${percentage}%"
          ></div>

        </div>

      `;


      distributionList.appendChild(
        item
      );

    }
  );
}


/* =========================================
   RECENT EXPENSES
========================================= */

function renderRecentExpenses(
  extraExpenses
) {

  recentExpenses.innerHTML = "";


  if (
    extraExpenses.length === 0
  ) {

    recentExpenses.innerHTML = `

      <div class="empty-dashboard"
           style="display:block; margin:0;">

        <div class="empty-dashboard-icon">
          ₹
        </div>

        <h2>
          No extra expenses yet
        </h2>

        <p>
          Add daily expenses from the Expense Input page.
        </p>

        <a href="index.html">
          Add Expense →
        </a>

      </div>

    `;

    return;
  }


  const sorted =
    [...extraExpenses].sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );


  sorted
    .slice(0, 5)
    .forEach(
      (expense) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "recent-item";


        item.innerHTML = `

          <div class="recent-date">
            ${formatDate(expense.date)}
          </div>

          <div class="recent-note">
            ${escapeHTML(expense.note)}
          </div>

          <div class="recent-amount">
            ${formatCurrency(
              getSafeNumber(
                expense.amount
              )
            )}
          </div>

        `;


        recentExpenses.appendChild(
          item
        );

      }
    );
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value || "";

  return div.innerHTML;
}


/* =========================================
   EMPTY DASHBOARD
========================================= */

function checkEmptyState(
  monthlyExpenses,
  extraExpenses
) {

  const monthlyTotal =
    calculateMonthlyTotal(
      monthlyExpenses
    );


  const extraTotal =
    calculateExtraTotal(
      extraExpenses
    );


  if (
    monthlyTotal === 0 &&
    extraTotal === 0
  ) {

    emptyDashboard.style.display =
      "block";

  } else {

    emptyDashboard.style.display =
      "none";
  }
}


/* =========================================
   UPDATE CHART
========================================= */

function updateChart(
  monthlyExpenses,
  extraExpenses
) {

  const monthlyTotal =
    calculateMonthlyTotal(
      monthlyExpenses
    );


  const extraTotal =
    calculateExtraTotal(
      extraExpenses
    );


  const total =
    monthlyTotal +
    extraTotal;


  const circle =
    document.querySelector(
      ".chart-circle"
    );


  if (!circle) {
    return;
  }


  if (total === 0) {

    circle.style.background =
      "#172033";

    return;
  }


  const monthlyPercentage =
    (monthlyTotal /
      total) *
    100;


  const monthlyDegrees =
    monthlyPercentage *
    3.6;


  circle.style.background =
    `
      conic-gradient(
        #2563eb 0deg,
        #2563eb ${monthlyDegrees}deg,
        #60a5fa ${monthlyDegrees}deg,
        #60a5fa 360deg
      )
    `;
}


/* =========================================
   INITIALIZE DASHBOARD
========================================= */

function initializeDashboard() {

  const monthlyExpenses =
    loadMonthlyExpenses();


  const extraExpenses =
    loadExtraExpenses();


  renderSummary(
    monthlyExpenses,
    extraExpenses
  );


  renderCategoryBreakdown(
    monthlyExpenses
  );


  renderDistribution(
    monthlyExpenses
  );


  renderRecentExpenses(
    extraExpenses
  );


  updateChart(
    monthlyExpenses,
    extraExpenses
  );


  checkEmptyState(
    monthlyExpenses,
    extraExpenses
  );
}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeDashboard
);
