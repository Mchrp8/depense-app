import { useState, useEffect } from "react";

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function getCategoryMeta(category) {
  switch (category) {
    case "Bouffe":
      return { emoji: "🍔", bg: "#fff1e6", color: "#c76b00" };
    case "Transport":
      return { emoji: "🚗", bg: "#eaf2ff", color: "#2f6fec" };
    case "Loisirs":
      return { emoji: "🎮", bg: "#f3eaff", color: "#7a3ff2" };
    case "Autres":
      return { emoji: "🧾", bg: "#f1f3f5", color: "#5f6b76" };
    default:
      return { emoji: "💸", bg: "#f1f3f5", color: "#5f6b76" };
  }
}

function getCategoryEmoji(category) {
  return getCategoryMeta(category).emoji;
}

function formatExpenseDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Aujourd’hui";
  if (isYesterday) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function App() {
  const currentMonthKey = getMonthKey();

  const [activeTab, setActiveTab] = useState("current");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Bouffe");
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("budget_data_v1");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      currentMonth: currentMonthKey,
      currentExpenses: [],
      history: {},
    };
  });

  useEffect(() => {
    setData((prev) => {
      if (prev.currentMonth === currentMonthKey) return prev;

      const updatedHistory = { ...prev.history };

      if (prev.currentExpenses.length > 0) {
        updatedHistory[prev.currentMonth] = prev.currentExpenses;
      }

      return {
        currentMonth: currentMonthKey,
        currentExpenses: [],
        history: updatedHistory,
      };
    });
  }, [currentMonthKey]);

  useEffect(() => {
    localStorage.setItem("budget_data_v1", JSON.stringify(data));
  }, [data]);

  const addExpense = () => {
    if (!amount.trim()) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    const newExpense = {
      id: Date.now(),
      amount: numericAmount,
      category,
      createdAt: new Date(selectedDate).toISOString(),
    };

    setData((prev) => ({
      ...prev,
      currentExpenses: [newExpense, ...prev.currentExpenses],
    }));

    setAmount("");

    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const removeExpense = (id) => {
    setData((prev) => ({
      ...prev,
      currentExpenses: prev.currentExpenses.filter((item) => item.id !== id),
    }));
  };

  const totalCurrent = data.currentExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const categoryTotals = {};

  data.currentExpenses.forEach((item) => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }
    categoryTotals[item.category] += item.amount;
  });

  const historyMonths = Object.keys(data.history).sort().reverse();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f2ff 0%, #f5f7fb 45%, #eef2f7 100%)",
        padding: 16,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
            borderRadius: 28,
            padding: 20,
            boxShadow: "0 12px 40px rgba(31, 31, 31, 0.08)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 14,
                color: "#6f6f7b",
                marginBottom: 6,
              }}
            >
              Mon budget
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              💰 Budget mensuel
            </h1>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "#5f6470",
                fontSize: 15,
              }}
            >
              Suis tes dépenses mois par mois, simplement.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              background: "#f3f4f8",
              borderRadius: 16,
              padding: 4,
              marginBottom: 18,
            }}
          >
            <button
              onClick={() => setActiveTab("current")}
              onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.95)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 12,
                padding: "12px 10px",
                background: activeTab === "current" ? "#18181b" : "transparent",
                transition: "transform 0.15s ease",
                color: activeTab === "current" ? "#fff" : "#555",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Ce mois-ci
            </button>

            <button
              onClick={() => setActiveTab("history")}
              onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.95)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 12,
                padding: "12px 10px",
                background: activeTab === "history" ? "#18181b" : "transparent",
                transition: "transform 0.15s ease",
                color: activeTab === "history" ? "#fff" : "#555",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Historique
            </button>
          </div>

          {activeTab === "current" ? (
            <>
              <div
                style={{
  background:
    "linear-gradient(135deg, #18181f 0%, #26283a 45%, #312e81 100%)",
  borderRadius: 26,
  padding: 20,
  color: "#fff",
  marginBottom: 18,
  boxShadow: "0 18px 40px rgba(49,46,129,0.28)",
  border: "1px solid rgba(255,255,255,0.08)",
}}
              >
                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.8,
                    marginBottom: 8,
                    textTransform: "capitalize",
                  }}
                >
                  {formatMonthLabel(data.currentMonth)}
                </div>

                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {totalCurrent.toFixed(2)} €
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    opacity: 0.8,
                  }}
                >
                  {data.currentExpenses.length} dépense
                  {data.currentExpenses.length > 1 ? "s" : ""}
                </div>
              </div>

              <div
                style={{
                  background: "#f8f8fc",
                  borderRadius: 20,
                  padding: 14,
                  marginBottom: 18,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant (€)"
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  borderRadius: 18,
                  border: "1px solid #e5e7eb",
                  fontSize: 17,
                  fontWeight: 600,
                  boxSizing: "border-box",
                  outline: "none",
                  background: "#ffffff",
                  color: "#18181b",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  }}
/>

<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  style={{
    width: "100%",
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    fontSize: 17,
    fontWeight: 600,
    boxSizing: "border-box",
    outline: "none",
    background: "#ffffff",
    color: "#374151",
    marginTop: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  }}
/>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 15,
                      fontWeight: 600,
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#ffffff",
                      color: "#2563eb",
                      marginTop: 2,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                      appearance: "none",
                    }}
                  >
                    <option>Bouffe</option>
                    <option>Transport</option>
                    <option>Loisirs</option>
                    <option>Autres</option>
                  </select>

                  <button
  onClick={addExpense}
  onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.95)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
  disabled={!amount.trim()}
  onMouseDown={(e) => {
    e.currentTarget.style.transform = "scale(0.97)";
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
  style={{
    width: "100%",
    padding: 15,
    borderRadius: 16,
    transition: "transform 0.15s ease",
    border: "none",
    background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(124,58,237,0.25)",
    opacity: amount.trim() ? 1 : 0.5,
    transition: "transform 0.1s ease, box-shadow 0.1s ease"
  }}
>
                    Ajouter la dépense
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h2
                  style={{
                    fontSize: 18,
                    color: "#18181b",
                    marginTop: 0,
                    marginBottom: 12,
                  }}
                >
                  Résumé par catégorie
                </h2>

                <div
                  style={{
                    background: "#f8f8fc",
                    borderRadius: 18,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {Object.keys(categoryTotals).length === 0 ? (
                    <div
                      style={{
                        color: "#7a7f8c",
                        textAlign: "center",
                        padding: 8,
                      }}
                    >
                      Aucun résumé pour le moment
                    </div>
                  ) : (
                    Object.entries(categoryTotals).map(([category, total]) => {
                      const percent = ((total / totalCurrent) * 100).toFixed(0);

                      return (
                        <div
                          key={category}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#fff",
                            borderRadius: 14,
                            padding: "12px 14px",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: getCategoryMeta(category).bg,
                              color: getCategoryMeta(category).color,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            <span>{getCategoryMeta(category).emoji}</span>
                            <span>{category}</span>
                          </div>

                          <strong style={{ color: "#18181b", fontSize: 15 }}>
                            {total.toFixed(2)} € ({percent}%)
                          </strong>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h2
                  style={{
                    fontSize: 18,
                    color: "#18181b",
                    marginTop: 0,
                    marginBottom: 12,
                  }}
                >
                  Dépenses du mois
                </h2>

                {data.currentExpenses.length === 0 ? (
                  <div
                    style={{
                      background: "#f8f8fc",
                      borderRadius: 18,
                      padding: 18,
                      textAlign: "center",
                      color: "#7a7f8c",
                    }}
                  >
                    Commence par ajouter ta première dépense ✨
                  </div>
                ) : (
                  [...data.currentExpenses]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .map((item) => (
                    <div
  key={item.id}
  onTouchStart={(e) => {
    e.currentTarget.style.transform = "scale(0.97)";
  }}
  onTouchEnd={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    transition: "transform 0.15s ease",
  }}
>
                      <div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#18181b",
                          }}
                        >
                          {item.amount.toFixed(2)} €
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: getCategoryMeta(item.category).bg,
                            color: getCategoryMeta(item.category).color,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span>{getCategoryMeta(item.category).emoji}</span>
                          <span>{item.category}</span>
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: "#9aa1ad",
                          }}
                        >
                          {formatExpenseDate(item.createdAt)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeExpense(item.id)}
                        style={{
                          border: "none",
                          background: "#fff",
                          borderRadius: 12,
                          padding: "10px 12px",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#333",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div>
              <h2
                style={{
                  fontSize: 18,
                  color: "#18181b",
                  marginTop: 0,
                  marginBottom: 12,
                }}
              >
                Historique mensuel
              </h2>

              {historyMonths.length === 0 ? (
                <div
                  style={{
                    background: "#f8f8fc",
                    borderRadius: 18,
                    padding: 18,
                    textAlign: "center",
                    color: "#7a7f8c",
                  }}
                >
                  Aucun mois archivé pour le moment
                </div>
              ) : (
                historyMonths.map((monthKey) => {
                  const monthExpenses = data.history[monthKey];
                  const monthTotal = monthExpenses.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );

                  return (
                    <div
                      key={monthKey}
                      style={{
                        background: "#f8f8fc",
                        borderRadius: 18,
                        padding: 16,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#18181b",
                          marginBottom: 6,
                          textTransform: "capitalize",
                        }}
                      >
                        {formatMonthLabel(monthKey)}
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          color: "#5f6470",
                          marginBottom: 10,
                        }}
                      >
                        Total : <strong>{monthTotal.toFixed(2)} €</strong>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {monthExpenses.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: "#fff",
                              borderRadius: 14,
                              padding: 12,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: getCategoryMeta(item.category).bg,
                                  color: getCategoryMeta(item.category).color,
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                <span>{getCategoryMeta(item.category).emoji}</span>
                                <span>{item.category}</span>
                              </div>

                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 12,
                                  color: "#9aa1ad",
                                }}
                              >
                                {formatExpenseDate(item.createdAt)}
                              </div>
                            </div>

                            <strong style={{ color: "#18181b" }}>
                              {item.amount.toFixed(2)} €
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}