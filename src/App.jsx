import { useState, useEffect } from "react";


  if (typeof window !== "undefined" && window.location.search.includes("reset")) {
  localStorage.clear();
}

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

function getCategoryStyle(category, categories) {
  const found = categories.find((item) => {
    if (typeof item === "string") return item === category;
    return item.name === category;
  });

  if (found && typeof found !== "string") {
    return {
      emoji: "🏷️",
      bg: `${found.color}22`,
      color: found.color,
    };
  }

  return getCategoryMeta(category);
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
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [amount, setAmount] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [category, setCategory] = useState("Bouffe");
  const [selectedFilter, setSelectedFilter] = useState("Toutes");
  
  const [categories, setCategories] = useState(() => {
  const saved = localStorage.getItem("categories");
  if (saved) return JSON.parse(saved);

  return [
  { name: "Bouffe", color: "#f97316" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Loisirs", color: "#a855f7" },
  { name: "Autres", color: "#6b7280" },
];
});
const [newCategory, setNewCategory] = useState("");
const [selectedColor, setSelectedColor] = useState("#f97316");


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
  const timer = setTimeout(() => {
    setIsExiting(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  }, 2000);

  return () => clearTimeout(timer);
}, []);


useEffect(() => {
  const color = darkMode ? "#18181b" : "#f7f2ff";

  document.body.style.background = color;

  let meta = document.querySelector("meta[name='theme-color']");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", color);
}, [darkMode]);

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

  useEffect(() => {
  localStorage.setItem("categories", JSON.stringify(categories));
}, [categories]);


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
  if (isLoading) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        background: darkMode
          ? "linear-gradient(180deg, #09090b 0%, #111827 45%, #18181b 100%)"
          : "linear-gradient(180deg, #faf7ff 0%, #f5f7fb 45%, #eef2ff 100%)",
        color: darkMode ? "#f4f4f5" : "#18181b",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(124,58,237,0.20) 0%, rgba(124,58,237,0) 70%)"
            : "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 70%)",
          filter: "blur(8px)",
          animation: "floatOrb1 6s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -90,
          right: -50,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 72%)"
            : "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0) 72%)",
          filter: "blur(10px)",
          animation: "floatOrb2 7s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          width: 104,
          height: 104,
          borderRadius: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          background: darkMode
            ? "linear-gradient(135deg, rgba(39,39,42,0.95) 0%, rgba(63,63,70,0.92) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(243,232,255,0.98) 100%)",
          border: darkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.9)",
          boxShadow: darkMode
            ? "0 25px 60px rgba(0,0,0,0.40)"
            : "0 25px 60px rgba(124,58,237,0.16)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          animation: "logoFloat 2.4s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 32,
            background:
              "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.20) 35%, transparent 65%)",
            transform: "translateX(-120%)",
            animation: "shine 2.6s ease-in-out infinite",
          }}
        />

        <div
          style={{
            fontSize: 46,
            position: "relative",
            zIndex: 1,
            filter: darkMode
              ? "drop-shadow(0 6px 16px rgba(124,58,237,0.28))"
              : "drop-shadow(0 6px 16px rgba(124,58,237,0.20))",
          }}
        >
          💰
        </div>
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 8,
          textAlign: "center",
          letterSpacing: "-0.7px",
          animation: "fadeUp 0.8s ease-out",
        }}
      >
        Budget mensuel
      </div>

      <div
        style={{
          fontSize: 14,
          color: darkMode ? "#a1a1aa" : "#6b7280",
          marginBottom: 24,
          textAlign: "center",
          letterSpacing: "0.2px",
          animation: "fadeUp 1s ease-out",
        }}
      >
        Un instant...
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "fadeUp 1.15s ease-out",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i === 1 ? "#7c3aed" : darkMode ? "#3f3f46" : "#d8ccff",
              boxShadow: i === 1 ? "0 0 16px rgba(124,58,237,0.35)" : "none",
              animation: `dotPulse 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 26,
          fontSize: 11,
          color: darkMode ? "#71717a" : "#a1a1aa",
          letterSpacing: "0.25px",
          animation: "fadeInSoft 1.4s ease-out",
        }}
      >
        Chargement sécurisé
      </div>

      <style>
        {`
          @keyframes fadeUp {
            0% {
              opacity: 0;
              transform: translateY(12px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInSoft {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes logoFloat {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-6px) scale(1.02); }
            100% { transform: translateY(0px) scale(1); }
          }

          @keyframes dotPulse {
            0%, 100% {
              transform: translateY(0) scale(0.9);
              opacity: 0.45;
            }
            50% {
              transform: translateY(-4px) scale(1.15);
              opacity: 1;
            }
          }

          @keyframes shine {
            0% { transform: translateX(-120%); opacity: 0; }
            20% { opacity: 1; }
            60% { transform: translateX(120%); opacity: 1; }
            100% { transform: translateX(120%); opacity: 0; }
          }

          @keyframes floatOrb1 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(18px, 16px); }
          }

          @keyframes floatOrb2 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-16px, -12px); }
          }
        `}
      </style>
    </div>
  );
}

  return (
  <div
    style={{
      minHeight: "100vh",
      animation: "tabFade 0.6s ease",
      
      background: darkMode
        ? "linear-gradient(180deg, #0f0f12 0%, #18181b 100%)"
        : "linear-gradient(180deg, #f7f2ff 0%, #f5f7fb 45%, #eef2f7 100%)",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}
  >

    
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "calc(env(safe-area-inset-top) + 16px)",
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: "border-box",
      }}
    >
        <div
          style={{
           background: darkMode
  ? "rgba(24,24,27,0.92)"
  : "rgba(255,255,255,0.88)",
            color: darkMode ? "#f4f4f5" : "#18181b",
            border: darkMode
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: 28,
            padding: 20,
            boxShadow: "0 12px 40px rgba(31, 31, 31, 0.08)",
            border: darkMode
  ? "1px solid rgba(255,255,255,0.06)"
  : "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 14,
                color: darkMode ? "#a1a1aa" : "#6f6f7b",
                
                marginBottom: 6,
              }}
            >
              Mon budget
            </div>

            <div
  style={{
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    marginBottom: 4,
  }}
>
  <div></div>

  <h1
    style={{
      margin: 0,
      fontSize: 30,
      color: darkMode ? "#f4f4f5" : "#18181b",
      lineHeight: 1.1,
      textAlign: "center",
      whiteSpace: "nowrap",
    }}
  >
    💰 Budget mensuel
  </h1>

  <button
    onClick={() => setShowSettings(!showSettings)}
    style={{
      border: "none",
      background: darkMode ? "#27272a" : "#f3f4f8",
      borderRadius: 12,
      padding: "8px 10px",
      cursor: "pointer",
      fontSize: 18,
      width: 44,
      height: 44,
      justifySelf: "end",
    }}
  >
    ⚙️
  </button>

  

</div>
{showSettings && (
  <div
    style={{
      marginTop: 12,
      marginBottom: 18,
      background: darkMode
  ? "rgba(24,24,27,0.96)"
  : "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: 20,
      padding: 14,
      border: darkMode
  ? "1px solid rgba(255,255,255,0.06)"
  : "1px solid rgba(255,255,255,0.7)",
      boxShadow: "0 10px 30px rgba(31,31,31,0.08)",
    }}
  >
    <div
      style={{
        fontSize: 15,
        fontWeight: 800,
        color: darkMode ? "#f4f4f5" : "#18181b",
        marginBottom: 4,
      }}
    >
      Réglages
    </div>

    <div
      style={{
        fontSize: 13,
        color: darkMode ? "#a1a1aa" : "#6b7280",
        marginBottom: 12,
      }}
    >
      Gère tes catégories et leurs couleurs
    </div>
    <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: darkMode ? "#232326" : "#f8f8fc",
  }}
>
  <div
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: darkMode ? "#f4f4f5" : "#18181b",
    }}
  >
    Mode sombre
  </div>

  <button
    onClick={() => setDarkMode(!darkMode)}
    style={{
      border: "none",
      background: darkMode ? "#18181b" : "#ede9fe",
      color: darkMode ? "#fff" : "#5b21b6",
      borderRadius: 999,
      padding: "8px 12px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    {darkMode ? "☀️ Clair" : "🌙 Sombre"}
  </button>
</div>

    <input
      type="text"
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
      placeholder="Nouvelle catégorie"
      onFocus={(e) => {
        e.target.style.border = "1px solid #7c3aed";
        e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
      }}
      onBlur={(e) => {
        e.target.style.border = "1px solid #ddd6fe";
        e.target.style.boxShadow = "0 4px 12px rgba(124,58,237,0.06)";
      }}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #ddd6fe",
        fontSize: 14,
        fontWeight: 500,
        boxSizing: "border-box",
        outline: "none",
        background: "#ffffff",
        color: "#18181b",
        boxShadow: "0 4px 12px rgba(124,58,237,0.06)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        marginTop: 6,
      }}
    />

    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
      
  
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  }}
>
  <label
    htmlFor="customColorPicker"
    style={{
      flex: 1,
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px dashed #c4b5fd",
      background: "#faf9ff",
      color: "#6d28d9",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      textAlign: "center",
      boxSizing: "border-box",
    }}
  >
    🎨 Couleur personnalisée
  </label>

  <input
    id="customColorPicker"
    type="color"
    value={selectedColor}
    onChange={(e) => setSelectedColor(e.target.value)}
    style={{
      width: 42,
      height: 42,
      padding: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      flexShrink: 0,
    }}
  />
</div>

<input
  id="customColorPicker"
  type="color"
  value={selectedColor}
  onChange={(e) => setSelectedColor(e.target.value)}
  style={{ display: "none" }}
/>
      {["#f97316", "#3b82f6", "#a855f7", "#10b981", "#ef4444"].map((color) => (
        <div
          key={color}
          onClick={() => setSelectedColor(color)}
          style={{
  width: selectedColor === color ? 28 : 24,
  height: selectedColor === color ? 28 : 24,
  flexShrink: 0,
  borderRadius: "50%",
  background: color,
  cursor: "pointer",
  border: selectedColor === color ? "3px solid #18181b" : "2px solid #fff",
  boxShadow:
    selectedColor === color
      ? "0 0 0 3px rgba(24,24,27,0.08)"
      : "0 4px 10px rgba(0,0,0,0.08)",
  transition: "all 0.15s ease",
}}
        />
      ))}
    </div>

    <button
      onClick={() => {
        if (!newCategory.trim()) return;

        const exists = categories.some((item) => {
          const name = typeof item === "string" ? item : item.name;
          return name.toLowerCase() === newCategory.trim().toLowerCase();
        });

        if (!exists) {
          setCategories([
            ...categories,
            { name: newCategory.trim(), color: selectedColor },
          ]);
        }

        setCategory(newCategory.trim());
        setNewCategory("");
        setSelectedColor("#f97316");
        setShowSettings(false);
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = "scale(0.97)";
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid #ddd6fe",
        background: "#f5f3ff",
        color: "#5b21b6",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        marginTop: 6,
        boxShadow: "0 4px 12px rgba(124,58,237,0.08)",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
      }}
    >
      Valider
    </button>

    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: darkMode ? "#a1a1aa" : "#6b7280",
          marginBottom: 8,
        }}
      >
        Catégories existantes
      </div>
<div
  style={{
    height: 1,
    background: darkMode ? "#3f3f46" : "#e5e7eb",
    marginBottom: 12,
  }}
/>
        

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {categories.map((item) => {
          const itemName = typeof item === "string" ? item : item.name;
          const itemColor =
            typeof item === "string"
              ? getCategoryMeta(item).color
              : item.color;

          const itemBg =
            typeof item === "string"
              ? getCategoryMeta(item).bg
              : `${item.color}22`;

          return (
            <div
              key={itemName}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 999,
                background: itemBg,
                color: itemColor,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span>{itemName}</span>

              <button
                onClick={() => {
                  
  const itemName = typeof item === "string" ? item : item.name;

  // 1. supprimer la catégorie
  const updatedCategories = categories.filter((cat) => {
    const catName = typeof cat === "string" ? cat : cat.name;
    return catName !== itemName;
  });

  // 2. supprimer les dépenses liées
  setData((prev) => ({
    ...prev,
    currentExpenses: prev.currentExpenses.filter(
      (expense) => expense.category !== itemName
    ),
  }));

  // 3. appliquer les nouvelles catégories
  setCategories(updatedCategories);

  // 4. si la catégorie actuelle est supprimée → fallback
  if (category === itemName && updatedCategories.length > 0) {
    const firstName =
      typeof updatedCategories[0] === "string"
        ? updatedCategories[0]
        : updatedCategories[0].name;

    setCategory(firstName);
  }
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = "#f3f4f6";
  e.currentTarget.style.color = "#111";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = "#6b7280";
}}
style={{
  border: "none",
  background: "transparent",
  color: "#6b7280",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  padding: "2px 4px",
  borderRadius: 6,
  transition: "background 0.1s ease, color 0.1s ease",
}}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, paddingTop: 12 }}>
  <button
    onClick={() => {
      if (confirm("Supprimer toutes les données ?")) {
        localStorage.clear();
        window.location.reload();
      }
    }}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: 12,
      border: "1px solid #fecaca",
      background: darkMode ? "#18181b" : "#fff",
      color: "#dc2626",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      opacity: 0.8,
    }}
  >
    Réinitialiser les données
  </button>
</div>
    </div>
  </div>
)}

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: darkMode ? "#a1a1aa" : "#5f6470",
                fontSize: 15,
              }}
            >
              Suis tes dépenses mois par mois, simplement.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              background: darkMode ? "#27272a" : "#f3f4f8",
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
                transition: "transform 0.15s ease",
               background:
                activeTab === "current"
                ? (darkMode ? "#3f3f46" : "#18181b")
                : "transparent",
                color:
                activeTab === "current"
                ? "#fff"
                : (darkMode ? "#a1a1aa" : "#555"),
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
                color: activeTab === "history" ? "#fff" : "#555",
                background:
                activeTab === "history"
                ? (darkMode ? "#3f3f46" : "#18181b")
                : "transparent",
                color:
                activeTab === "history"
                ? "#fff"
                : (darkMode ? "#a1a1aa" : "#555"),
                transition: "transform 0.15s ease",
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
    animation: "tabFade 1s ease",
   
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
                  background: darkMode ? "#232326" : "#f8f8fc",
                  border: darkMode ? "1px solid rgba(255,255,255,0.06)" : "none",
                  boxShadow: darkMode
  ? "0 10px 30px rgba(0,0,0,0.25)"
  : "0 10px 30px rgba(31,31,31,0.06)",
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 18,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant (€)"
                onFocus={(e) => {
  e.target.style.border = "1px solid #7c3aed";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
}}
onBlur={(e) => {
  e.target.style.border = darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe";
e.target.style.boxShadow = darkMode
  ? "0 6px 18px rgba(0,0,0,0.25)"
  : "0 6px 18px rgba(124,58,237,0.08)";
}}
                style={{
                width: "100%",
                padding: "16px 18px",
                borderRadius: 18,
                fontSize: 17,
                fontWeight: 600,
                boxSizing: "border-box",
                outline: "none",
                background: darkMode ? "#18181b" : "#ffffff",
                color: darkMode ? "#f4f4f5" : "#18181b",
                border: darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe",
                boxShadow: "0 6px 18px rgba(124,58,237,0.08)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
}}
/>

<input
  type="date"
  onFocus={(e) => {
  e.target.style.border = "1px solid #7c3aed";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
}}
onBlur={(e) => {
  e.target.style.border = darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe";
e.target.style.boxShadow = darkMode
  ? "0 6px 18px rgba(0,0,0,0.25)"
  : "0 6px 18px rgba(124,58,237,0.08)";
}}
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  style={{
  width: "100%",
  height: 48,
  padding: "0 12px",
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 600,
  boxSizing: "border-box",
  outline: "none",
  background: darkMode ? "#18181b" : "#ffffff",
  color: darkMode ? "#f4f4f5" : "#374151",
  border: darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe",
  marginTop: 10,
  boxShadow: "0 6px 18px rgba(124,58,237,0.08)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  WebkitAppearance: "none",
}}
/>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onFocus={(e) => {
  e.target.style.border = "1px solid #7c3aed";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
}}
onBlur={(e) => {
  e.target.style.border = darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe";
e.target.style.boxShadow = darkMode
  ? "0 6px 18px rgba(0,0,0,0.25)"
  : "0 6px 18px rgba(124,58,237,0.08)";
}}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      boxSizing: "border-box",
                      outline: "none",
                      border: "1px solid #ddd6fe",
                      boxShadow: "0 6px 18px rgba(124,58,237,0.08)",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                      background: darkMode ? "#18181b" : "#ffffff",
                      color: darkMode ? "#c4b5fd" : "#2563eb",
                      border: darkMode ? "1px solid #3f3f46" : "1px solid #ddd6fe",
                      marginTop: 2,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                      appearance: "none",
                    }}
                  >
                   {categories.map((item) => {
  const categoryName = typeof item === "string" ? item : item.name;

  return (
    <option key={categoryName} value={categoryName}>
      {categoryName}
    </option>
  );
})}
                  </select>
                  
                  
  <>
    

    
  </>


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
                    color: darkMode ? "#f4f4f5" : "#18181b",
                    marginTop: 0,
                    marginBottom: 12,
                  }}
                >
                  Résumé par catégorie
                </h2>

                <div
                  style={{
                    background: darkMode ? "#232326" : "#f8f8fc",
                    borderRadius: 18,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
  <button
    onClick={() => setSelectedFilter("Toutes")}
    style={{
      border: "none",
      background:
  selectedFilter === "Toutes"
    ? (darkMode ? "#3f3f46" : "#18181b")
    : (darkMode ? "#27272a" : "#f3f4f6"),

color:
  selectedFilter === "Toutes"
    ? "#fff"
    : (darkMode ? "#d4d4d8" : "#374151"),
      borderRadius: 999,
      padding: "8px 12px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Toutes
  </button>
</div>
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
  onClick={() =>
    setSelectedFilter(
      selectedFilter === category ? "Toutes" : category
    )
  }
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
  selectedFilter === category
    ? (darkMode ? "#312e81" : "#ede9fe")
    : (darkMode ? "#18181b" : "#fff"),
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    border:
  selectedFilter === category
    ? "2px solid #7c3aed"
    : darkMode
      ? "1px solid #27272a"
      : "1px solid transparent",
    transition: "all 0.15s ease",
  }}
>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: getCategoryStyle(category, categories).bg,
                              color: getCategoryStyle(category, categories).color,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            <span>{getCategoryStyle(category, categories).emoji}</span>
                            <span>{category}</span>
                          </div>

                          <strong
  style={{
    color: darkMode ? "#f4f4f5" : "#18181b",
    fontSize: 15,
  }}
>
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
                    color: darkMode ? "#f4f4f5" : "#18181b",
                    marginTop: 0,
                    marginBottom: 12,
                  }}
                >
                  Dépenses du mois
                </h2>

                {data.currentExpenses.length === 0 ? (
                  <div
                    style={{
                      background: darkMode ? "#232326" : "#f8f8fc",
color: darkMode ? "#a1a1aa" : "#7a7f8c",
                      borderRadius: 18,
                      padding: 18,
                      textAlign: "center",

                    }}
                  >
                    Commence par ajouter ta première dépense ✨
                  </div>
                ) : (
                  [...data.currentExpenses]
  .filter(
    (item) =>
      selectedFilter === "Toutes" || item.category === selectedFilter
  )
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .map((item, index) => (
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
  animation: "expenseIn 0.35s ease",
  animation: index === 0 ? "expenseIn 0.75s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
  justifyContent: "space-between",
  alignItems: "center",
  background: darkMode ? "rgba(39,39,42,0.95)" : "rgba(255,255,255,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  borderRadius: 22,
  padding: 16,
  marginBottom: 12,
  transition: "transform 0.15s ease, box-shadow 0.2s ease",
  border: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.7)",
boxShadow: darkMode
  ? "0 10px 30px rgba(0,0,0,0.22)"
  : "0 10px 30px rgba(31,31,31,0.06)",
}}
>
                      <div>
                        <div
                          style={{
  fontSize: 19,
  fontWeight: 800,
  color: darkMode ? "#f4f4f5" : "#111827",
  letterSpacing: "-0.3px",
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
                            background: getCategoryStyle(item.category, categories).bg,
                            color: getCategoryStyle(item.category, categories).color,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span>{getCategoryStyle(item.category, categories).emoji}</span>
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
                        onTouchStart={(e) => {
  e.currentTarget.style.transform = "scale(0.95)";
}}
onTouchEnd={(e) => {
  e.currentTarget.style.transform = "scale(1)";
}}
                        style={{
  border: "none",
  background: darkMode ? "#18181b" : "rgba(255,255,255,0.85)",
  color: darkMode ? "#d4d4d8" : "#6b7280",
  borderRadius: 14,
  padding: "10px 14px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,  
  boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  transition: "transform 0.15s ease, background 0.2s ease",
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
                  color: darkMode ? "#f4f4f5" : "#18181b",
                  marginTop: 0,
                  marginBottom: 12,
                }}
              >
                Historique mensuel
              </h2>

              {historyMonths.length === 0 ? (
                <div
                  style={{
                    background: darkMode ? "#232326" : "#f8f8fc",
color: darkMode ? "#a1a1aa" : "#7a7f8c",
                    borderRadius: 18,
                    padding: 18,
                    textAlign: "center",
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
                        background: darkMode ? "#232326" : "#f8f8fc",
                        borderRadius: 18,
                        padding: 16,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: darkMode ? "#f4f4f5" : "#18181b",
                          marginBottom: 6,
                          textTransform: "capitalize",
                        }}
                      >
                        {formatMonthLabel(monthKey)}
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          color: darkMode ? "#a1a1aa" : "#5f6470",
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
                              background: darkMode ? "#18181b" : "#fff",
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
                                  background: getCategoryStyle(item.category, categories).bg,
                                  color: getCategoryStyle(item.category, categories).color,
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                <span>{getCategoryStyle(item.category, categories).emoji}</span>
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
      

      
      <div
  style={{
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: darkMode ? "#71717a" : "#9aa1ad",
    fontWeight: 500,
    letterSpacing: "0.3px",
  }}
>
  Made by Mathou 
</div>
<style>
  {`
    @keyframes expenseIn {
      0% {
        opacity: 0;
        transform: translateY(26px) scale(0.94);
        filter: blur(6px);
      }
      60% {
        opacity: 1;
        transform: translateY(-4px) scale(1.01);
        filter: blur(0);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }
  `}
</style>

<style>
  {`
    @keyframes tabFade {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}
</style>
    </div>
  );
}
