let currentUser = "tommy";
let currentPage = "dashboard";

const pageTitles = {
  dashboard: "Dashboard",
  budget: "Budget",
  bills: "Bills",
  card: "Spennnin Money",
  transactions: "Transactions",
  flex: "Amazon Flex",
  settings: "Settings"
};

function switchUser(user) {
  currentUser = user;
  currentPage = "dashboard";

  const app = document.getElementById("app");
  const welcome = document.getElementById("welcome");
  const flexLink = document.getElementById("flexLink");

  if (user === "ashley") {
    app.className = "app ashley-theme";
    welcome.textContent = "Welcome back, Ashley! ???";
    flexLink.style.display = "none";
  } else {
    app.className = "app tommy-theme";
    welcome.textContent = "Welcome back, Tommy ??";
    flexLink.style.display = "block";
  }

  setActiveUser();
  loadPage("dashboard");
}

function setActiveUser() {
  document.querySelectorAll(".user-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(currentUser + "Btn").classList.add("active");
}

function loadPage(page) {
  if (page === "flex" && currentUser === "ashley") return;

  currentPage = page;

  document.querySelectorAll("nav a").forEach(a => a.classList.remove("nav-active"));
  const active = document.querySelector(`[data-page="${page}"]`);
  if (active) active.classList.add("nav-active");

  document.getElementById("pageTitle").textContent = pageTitles[page];

  const content = document.getElementById("content");

  if (page === "dashboard") {
    content.innerHTML = dashboardView();
  }

  if (page === "budget") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Budget</h3>
        <p>This is where paycheck budgets, groceries, misc, card funding, and savings cushion will be managed.</p>
      </section>
    `;
  }

  if (page === "bills") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Bills</h3>
        <ul>
          <li>State Farm <span>$16.00</span></li>
          <li>YouTube Premium <span>$17.00</span></li>
          <li>Cricket Wireless <span>$98.00</span></li>
          <li>MUD Half Payment <span>$84.00</span></li>
        </ul>
      </section>
    `;
  }

  if (page === "card") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Spennnin Money</h3>
        <h2>$300.00</h2>
        <p>Card purchases will reduce this card balance only.</p>
      </section>
    `;
  }

  if (page === "transactions") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Transactions</h3>
        <ul>
          <li>Bakers <span>Groceries</span></li>
          <li>Amazon <span>Misc</span></li>
          <li>Card Transfer <span>Spennnin Money</span></li>
        </ul>
      </section>
    `;
  }

  if (page === "flex") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Amazon Flex</h3>
        <h2>$0.00</h2>
        <p>This section is only available for Tommy.</p>
      </section>
    `;
  }

  if (page === "settings") {
    content.innerHTML = `
      <section class="panel full">
        <h3>Settings</h3>
        <p>User themes, bank connections, backups, and login settings will go here.</p>
      </section>
    `;
  }
}

function dashboardView() {
  const data = currentUser === "tommy"
    ? { bills:"$415.00", spending:"$704.36", save:"$400.00", cash:"$795.24", flex:true }
    : { bills:"$350.00", spending:"$980.00", save:"$420.00", cash:"$1,250.00", flex:false };

  return `
    <section class="grid">
      <div class="card"><p>Bills Remaining</p><h3>${data.bills}</h3><small>Unpaid bills</small></div>
      <div class="card"><p>Spending Budget</p><h3>${data.spending}</h3><small>Groceries + misc + card</small></div>
      <div class="card"><p>Available to Save</p><h3>${data.save}</h3><small>After bills, spending, cushion</small></div>
      <div class="card"><p>Cash Left</p><h3>${data.cash}</h3><small>Live checking estimate</small></div>
    </section>

    <section class="two-col">
      <div class="panel">
        <h3>Upcoming Paycheck</h3>
        <div class="countdown">
          <div><b>12</b><span>Days</span></div>
          <div><b>14</b><span>Hours</span></div>
          <div><b>32</b><span>Minutes</span></div>
        </div>
        <p>Paycheck #2 · Jun 26 · $2,164.60</p>
      </div>

      <div class="panel" style="${data.flex ? "" : "display:none"}">
        <h3>Amazon Flex</h3>
        <h2>$0.00</h2>
        <p>Tommy only</p>
      </div>
    </section>

    <section class="two-col">
      <div class="panel">
        <h3>Bills</h3>
        <ul>
          <li>State Farm <span>$16.00</span></li>
          <li>YouTube Premium <span>$17.00</span></li>
          <li>Cricket Wireless <span>$98.00</span></li>
          <li>MUD Half Payment <span>$84.00</span></li>
        </ul>
      </div>

      <div class="panel">
        <h3>Recent Transactions</h3>
        <ul>
          <li>Bakers <span>Groceries</span></li>
          <li>Amazon <span>Misc</span></li>
          <li>Card Transfer <span>Spennnin Money</span></li>
        </ul>
      </div>
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav a").forEach(a => {
    a.addEventListener("click", () => loadPage(a.dataset.page));
  });

  setActiveUser();
  loadPage("dashboard");
});
