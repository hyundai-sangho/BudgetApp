export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString);

    this.root.innerHTML = BudgetTracker.html();
    this.root.querySelector(".new-entry").addEventListener("click", () => {
      this.onNewEntryBtnClick();
    });

    // 로컬 스토리지에서 초기 데이터를 로드하십시오
    this.load();
  }

  static html() {
    return `
    <table class="budget-tracker">
      <thead>
        <tr>
          <th>날짜</th>
          <th>설명</th>
          <th>유형</th>
          <th>금액</th>
          <th></th>
        </tr>
      </thead>
      <tbody class="entries"></tbody>
      <tbody>
        <tr>
          <td colspan="5" class="controls">
            <button type="button" class="new-entry">새로운 항목</button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="summary">
            <strong>총:</strong>
            <span class="total">0원</span>
          </td>
        </tr>
      </tfoot>
    </table>
    `;
  }

  static entryHtml() {
    return `
    <tr>
      <td>
        <input type="date" class="input input-date">
      </td>
      <td>
        <input type="text" class="input input-description" placeholder="설명 추가 (예 : 임금, 청구서 등)" />
      </td>
      <td>
        <select class=" input input-type">
          <option value="income">소득</option>
          <option value="expense">비용</option>
        </select>
      </td>
      <td>
        <input type="number" class="input input-amount">
      </td>
      <td>
        <button type="button" class="delete-entry">&#10005;</button>
      </td>
    </tr>
    `;
  }

  load() {
    const entries = JSON.parse(localStorage.getItem("budget-tracker-entries-dev") || "[]");

    console.log("entries: " + entries);

    for (const entry of entries) {
      this.addEntry(entry);
    }

    this.updateSummary();
  }

  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector(".input-amount").value;
      const isExpense = row.querySelector(".input-type").value === "expense";
      const modifier = isExpense ? -1 : 1;

      return total + amount * modifier;
    }, 0);

    const totalFormatted = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(total);

    this.root.querySelector(".total").textContent = totalFormatted + "원";
  }

  save() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector(".input-date").value,
        description: row.querySelector(".input-description").value,
        type: row.querySelector(".input-type").value,
        amount: parseFloat(row.querySelector(".input-amount").value),
      };
    });

    localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    this.updateSummary();
  }

  addEntry(entry = {}) {
    this.root.querySelector(".entries").insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

    const row = this.root.querySelector(".entries tr:last-of-type");

    row.querySelector(".input-date").value = entry.date || new Date().toISOString().replace(/T.*/, "");
    row.querySelector(".input-description").value = entry.description || "";
    row.querySelector(".input-type").value = entry.type || "income";
    row.querySelector(".input-amount").value = entry.amount || 0;
    row.querySelector(".delete-entry").addEventListener("click", (e) => {
      this.onDeleteEntryBtnClick(e);
    });

    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.save());
    });
  }

  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".entries tr"));
  }

  onNewEntryBtnClick() {
    this.addEntry();
  }

  onDeleteEntryBtnClick(e) {
    e.target.closest("tr").remove();

    this.save();
  }
}
