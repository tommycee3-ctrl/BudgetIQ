import { useEffect, useState } from "react";
import "./Bills.css";

type Bill = {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  dueDay: number;
  paid: number;
  active: number;
  splitEachPayday: number;
};

export function Bills({ userId }: { userId: number }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [splitEachPayday, setSplitEachPayday] = useState(false);

  async function loadBills() {
    const res = await fetch("/api/bills/" + userId);
    const data = await res.json();
    if (data.ok) setBills(data.bills);
  }

  async function addBill() {
    if (!name || !amount || !dueDay) return;

    await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, amount, dueDay, splitEachPayday })
    });

    setName("");
    setAmount("");
    setDueDay("");
    setSplitEachPayday(false);
    loadBills();
  }

  async function togglePaid(bill: Bill) {
    await fetch("/api/bills/" + bill.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bill.name,
        amount: bill.amount,
        dueDay: bill.dueDay,
        splitEachPayday: Boolean(bill.splitEachPayday),
        paid: !bill.paid
      })
    });

    loadBills();
  }

  async function deleteBill(id: number) {
    await fetch("/api/bills/" + id, { method: "DELETE" });
    loadBills();
  }

  useEffect(() => {
    loadBills();
  }, [userId]);

  return (
    <div className="bills-page">
      <div className="panel">
        <h2>Bills</h2>
        <p>Add, edit, and mark bills paid. Split bills count half each payday.</p>

        <div className="bill-form">
          <input placeholder="Bill name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <input placeholder="Due day" type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} />

          <label className="split-box">
            <input type="checkbox" checked={splitEachPayday} onChange={e => setSplitEachPayday(e.target.checked)} />
            Split each payday
          </label>

          <button onClick={addBill}>Add Bill</button>
        </div>
      </div>

      <div className="panel">
        {bills.map(bill => (
          <div className="bill-row" key={bill.id}>
            <div>
              <strong>{bill.name}</strong>
              <p>
                ${Number(bill.amount).toFixed(2)} · Due day {bill.dueDay}
                {bill.splitEachPayday ? " · Split each payday" : ""}
              </p>
            </div>

            <div className="bill-actions">
              <button onClick={() => togglePaid(bill)}>
                {bill.paid ? "Mark Unpaid" : "Mark Paid"}
              </button>
              <button onClick={() => deleteBill(bill.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
