import { useState, useEffect } from "react";
import {
  Bell, User, TrendingUp, Download, TriangleAlert, Leaf, Truck,
  MapPin, ShieldCheck, ChevronDown, X, BarChart2, LayoutDashboard, List, Settings
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// Hardcoded reference pool synchronized with backend dishes database
const AVAILABLE_DISHES = [
  "Paneer Butter Masala", "Vegetable Biryani", "Paal Payasam", "Masala Vada",
  "Idli Sambar", "Curd Rice", "Rasam", "Dal Makhani", "Butter Naan",
  "Chole Bhature", "Gulab Jamun", "Mac and Cheese", "Veggie Burger Sliders",
  "French Fries", "Chocolate Brownies"
];

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? "#a14949" : "#e9e8e6" }}
    >
      <span
        className="inline-block w-5 h-5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(26px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Nav({ activePage, setActivePage }) {
  const links = [
    { id: "dashboard", label: "Dashboard" },
    { id: "events", label: "Event List" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e9e8e6] h-14 flex items-center px-8">
      <span
        className="font-bold text-xl tracking-tight mr-10 cursor-pointer"
        style={{ color: "#a14949", fontFamily: "'Hanken Grotesk', sans-serif" }}
        onClick={() => setActivePage("dashboard")}
      >
        WastePredictr
      </span>
      <nav className="flex items-center gap-6 flex-1">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => setActivePage(l.id)}
            className="text-sm font-medium pb-px transition-colors bg-transparent border-0 cursor-pointer"
            style={{
              color: activePage === l.id ? "#a14949" : "#554241",
              borderBottom: activePage === l.id ? "2px solid #a14949" : "2px solid transparent",
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button className="text-[#554241] bg-transparent border-0 cursor-pointer hover:text-[#1a1c1b] transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-[#554241] bg-transparent border-0 cursor-pointer hover:text-[#1a1c1b] transition-colors">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}

function MapPlaceholder() {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#e9e8e6]" style={{ background: "#d9d9d9" }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
        <rect width="100%" height="100%" fill="#dadad8" />
        {[30,60,90,120,150,170].map((y, i) => (
          <line key={`h${i}`} x1="0" y1={y} x2="100%" y2={y} stroke="#c8c6c4" strokeWidth="1.5" />
        ))}
        {[60,130,200,280,360,450,530,610].map((x, i) => (
          <line key={`v${i}`} x1={x} y1="0" x2={x} y2="100%" stroke="#c8c6c4" strokeWidth="1.5" />
        ))}
        <line x1="0" y1="96" x2="100%" y2="96" stroke="#b8b6b4" strokeWidth="3" />
        <line x1="280" y1="0" x2="280" y2="100%" stroke="#b8b6b4" strokeWidth="3" />
        <line x1="0" y1="192" x2="640" y2="0" stroke="#b8b6b4" strokeWidth="2" />
        <rect x="65" y="35" width="55" height="40" rx="2" fill="#c4c2c0" />
        <rect x="145" y="35" width="45" height="40" rx="2" fill="#c4c2c0" />
        <rect x="300" y="105" width="70" height="35" rx="2" fill="#c4c2c0" />
        <rect x="65" y="110" width="55" height="45" rx="2" fill="#c8c6c4" />
        <rect x="390" y="35" width="50" height="50" rx="2" fill="#c4c2c0" />
        <rect x="460" y="110" width="60" height="40" rx="2" fill="#c4c2c0" />
        <rect x="550" y="35" width="50" height="45" rx="2" fill="#c8c6c4" />
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg border border-[#e9e8e6] px-4 py-3 flex items-center gap-3 shadow-sm" style={{ minWidth: 240 }}>
        <MapPin size={16} style={{ color: "#a14949" }} />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#887271] font-bold">Active Logistics</p>
          <p className="text-sm font-semibold text-[#1a1c1b]">Food Bank Service Route Active</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [adults, setAdults] = useState(450);
  const [children, setChildren] = useState(120);
  const [eventType, setEventType] = useState("Wedding");
  const [mealType, setMealType] = useState("Lunch");
  const [muhurtham, setMuhurtham] = useState(true);
  const [menuItems, setMenuItems] = useState([
    "Paneer Butter Masala", "Vegetable Biryani", "Paal Payasam", "Masala Vada",
  ]);
  const [menuSearch, setMenuSearch] = useState("");

  const suggestions = AVAILABLE_DISHES.filter(
    (s) => !menuItems.includes(s) && s.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const removeItem = (item) => setMenuItems(menuItems.filter((m) => m !== item));
  const addItem = (item) => { setMenuItems([...menuItems, item]); setMenuSearch(""); };

  const triggerPrediction = async () => {
    setLoading(true);
    const payload = {
      num_adults: parseInt(adults) || 0,
      num_children: parseInt(children) || 0,
      event_type: eventType,
      meal_type: mealType,
      auspicious_day: muhurtham,
      menu_items: menuItems
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Pipeline alignment drop.");
      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error(err);
      alert("Error parsing live prediction. Ensure local backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-[#e9e8e6] rounded-lg px-3 py-2.5 text-sm text-[#1a1c1b] bg-white focus:outline-none focus:border-[#a14949] transition-colors";
  const labelCls = "text-xs uppercase tracking-widest font-bold text-[#887271] mb-1.5 block";

  return (
    <div className="flex h-screen pt-14" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* LEFT INPUT CONTROLS PANE */}
      <div className="w-2/5 border-r border-[#e9e8e6] overflow-y-auto" style={{ background: "#faf9f7" }}>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#1a1c1b] mb-1">Event Context & Menu</h2>
          <p className="text-sm text-[#554241] mb-8">Configure your logistical parameters for AI estimation.</p>

          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className={labelCls}>Number of Adults</label>
              <input type="number" value={adults} onChange={(e) => setAdults(e.target.value)} className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Number of Children</label>
              <input type="number" value={children} onChange={(e) => setChildren(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="mb-5">
            <label className={labelCls}>Event Type</label>
            <div className="relative">
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputCls + " appearance-none pr-9 cursor-pointer"}>
                {["Wedding", "Birthday", "Corporate", "Temple Festival", "Engagement"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887271] pointer-events-none" />
            </div>
          </div>

          <div className="mb-5">
            <label className={labelCls}>Meal Type</label>
            <div className="relative">
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={inputCls + " appearance-none pr-9 cursor-pointer"}>
                {["Lunch", "Dinner", "Breakfast", "Brunch", "Tea Reception"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887271] pointer-events-none" />
            </div>
          </div>

          <div className="mb-5 border border-[#e9e8e6] rounded-lg px-4 py-3 bg-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1c1b]">Highly Auspicious Day (Muhurtham)</p>
              <p className="text-xs text-[#887271] mt-0.5">Predicts 15–20% higher guest variability</p>
            </div>
            <Toggle checked={muhurtham} onChange={setMuhurtham} />
          </div>

          <div className="mb-8">
            <label className={labelCls}>Menu Items</label>
            <div className="border border-[#e9e8e6] rounded-lg bg-white p-3 min-h-[120px] relative">
              <div className="flex flex-wrap gap-2 mb-2">
                {menuItems.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-[#e9e8e6] bg-[#f4f3f1] text-[#1a1c1b]">
                    {item}
                    <button onClick={() => removeItem(item)} className="text-[#887271] bg-transparent border-0 cursor-pointer hover:text-[#a14949] ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search and add dishes..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full text-sm text-[#554241] placeholder-[#887271] focus:outline-none bg-transparent"
              />
              {menuSearch && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#e9e8e6] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto p-1 flex flex-col gap-0.5">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => addItem(s)} className="text-left text-xs px-3 py-2 text-[#554241] hover:bg-[#faf9f7] hover:text-[#a14949] rounded transition-colors bg-transparent border-0 cursor-pointer w-full">
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={triggerPrediction}
            disabled={loading || menuItems.length === 0}
            className="w-full py-4 rounded-full text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 border-0 cursor-pointer"
            style={{ background: "#a14949" }}
          >
            {loading ? "Calculating Matrices..." : "Run AI Prediction"}
          </button>
        </div>
      </div>

      {/* RIGHT DISPLAY ENGINE PANE */}
      <div className="w-3/5 overflow-y-auto bg-white">
        {!predictionData ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-12">
            <div className="w-16 h-16 rounded-full border-2 border-[#e9e8e6] flex items-center justify-center mb-6">
              <BarChart2 size={28} style={{ color: "#dbc1bf" }} />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1c1b] mb-2">No Prediction Yet</h3>
            <p className="text-sm text-[#887271] max-w-xs">
              Enter your event parameters on the left, then run the AI to generate full logistics.
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "#a14949" }}>Live Forecast</p>
                <h2 className="text-3xl font-bold text-[#1a1c1b]">Estimation Summary</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#00734b" }}>
                <ShieldCheck size={14} />
                Calculated Formula Alignment
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="border border-[#e9e8e6] rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-[#887271] mb-2">Predicted Guests</p>
                <p className="text-4xl font-bold text-[#1a1c1b] mb-1">{predictionData.total_guests_predicted}</p>
                <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#00734b" }}>
                  <TrendingUp size={12} /> Target Calibration
                </p>
              </div>
              <div className="border border-[#e9e8e6] rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-[#887271] mb-2">Approximate Expense</p>
                <p className="text-3xl font-bold text-[#1a1c1b] mb-1">{predictionData.approximate_expense}</p>
                <p className="text-xs text-[#887271]">Scaled Material Cost</p>
              </div>
              <div className="border border-[#e9e8e6] rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest font-bold text-[#887271] mb-2">Purchase List</p>
                <div className="text-xs text-[#554241] mb-2 font-medium">
                  {Object.entries(predictionData.shopping_list_preview).map(([k, v]) => (
                    <div key={k} className="truncate">{k.split(" ")[0]}: <strong>{v}</strong></div>
                  ))}
                </div>
                <button className="flex items-center gap-2 text-xs font-semibold text-[#1a1c1b] bg-white border border-[#e9e8e6] px-3 py-1.5 rounded-lg hover:border-[#a14949] transition-colors cursor-pointer">
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#dbc1bf] p-5 mb-5" style={{ background: "#fdf5f5" }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold" style={{ color: "#a14949" }}>Predicted Waste Profile</h3>
                <Leaf size={20} style={{ color: "#a14949" }} />
              </div>
              <p className="text-sm mb-4" style={{ color: "#a14949" }}>
                Estimated <strong>~{predictionData.expected_leftover_kg}kg</strong> <span className="font-normal text-[#554241]">Surplus ({predictionData.waste_percentage}% Footprint)</span>
              </p>

              {menuItems.includes("Paal Payasam") && (
                <div className="bg-white border border-[#dbc1bf] rounded-lg p-4 flex gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#a14949" }}>
                    <TriangleAlert size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1c1b] mb-1">AI Insight: Spoilage Threat</p>
                    <p className="text-sm text-[#554241]">
                      <span className="font-semibold" style={{ color: "#a14949" }}>High Risk:</span> Dairy-heavy elements (<em>Paal Payasam</em>) run extreme micro-spoilage risks in summer weather. Ensure refrigeration or step prep schedule to T-2 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <MapPlaceholder />

            <button className="mt-5 w-full py-4 rounded-full text-white font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-opacity border-0 cursor-pointer" style={{ background: "#a14949" }}>
              <Truck size={18} /> Put Food Bank Logistics on Standby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Remaining modular view placeholders stay clean and scannable
function EventList() {
  const events = [
    { date: "Jun 22, 2026", name: "Sharma Wedding Reception", guests: 850, waste: "45 kg", status: "NGO Standby" },
    { date: "Jun 19, 2026", name: "Ravi & Priya Engagement", guests: 320, waste: "18 kg", status: "Completed" },
  ];
  return (
    <div className="pt-14 min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Tracked Catering Dispatches</h2>
        {events.map((e, idx) => (
          <div key={idx} className="flex justify-between border-b py-3 text-sm">
            <span><strong>{e.name}</strong> ({e.date})</span>
            <span className="text-[#a14949] font-bold">{e.waste} surplus</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  const data = [{ month: "Jan", kg: 120 }, { month: "Feb", kg: 185 }, { month: "Mar", kg: 143 }];
  return (
    <div className="pt-14 min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Food Optimization Analytics</h2>
      <div className="h-64 border p-4 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <Tooltip />
            <Bar dataKey="kg" fill="#a14949" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="pt-14 min-h-screen bg-white p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <p className="text-sm text-gray-500">API hooks linked out seamlessly to Tiruchirappalli Distribution Centers.</p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  return (
    <div>
      <Nav activePage={activePage} setActivePage={setActivePage} />
      {activePage === "dashboard" && <Dashboard />}
      {activePage === "events" && <EventList />}
      {activePage === "analytics" && <Analytics />}
      {activePage === "settings" && <SettingsPage />}
    </div>
  );
}