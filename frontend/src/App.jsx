import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Login from "./pages/Login";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import FuelLogs from "./pages/FuelLogs";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
export default function App() {

  const [auth, setAuth] = useState(() => {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" ? JSON.parse(user) : null;
  });
  
  const [page, setPage] = useState("Dashboard");
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  if (!auth) return <Login setAuth={setAuth} notify={notify} />;

  return (
    <div className="app">
      <Sidebar auth={auth} page={page} setPage={setPage} logout={() => { localStorage.clear(); setAuth(null); }} />
      <main>
        <header>
          <div>
            <p className="eyebrow">Smart Transport Operations Platform</p>
            <h2>{page}</h2>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.section key={page} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {page === "Dashboard" && <Dashboard notify={notify} auth={auth} />}
            {page === "Vehicles" && <Vehicles notify={notify} auth={auth} />}
            {page === "Drivers" && <Drivers notify={notify} auth={auth} />}
            {page === "Trips" && <Trips notify={notify} auth={auth} />}
            {page === "Maintenance" && <Maintenance notify={notify} auth={auth} />}
            {page === "Fuel" && <FuelLogs notify={notify} auth={auth} />}
            {page === "Expenses" && <Expenses notify={notify} auth={auth} />}
            {page === "Analytics" && <Analytics notify={notify} auth={auth} />}
            {page === "Reports" && <Reports notify={notify} auth={auth} />}
            {page === "Settings" && <Settings auth={auth} notify={notify}/>}
          </motion.section>
        </AnimatePresence>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}