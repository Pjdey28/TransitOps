import React from "react";
import {
  Bus,
  ClipboardList,
  Download,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  SettingsIcon,
  Truck,
  User,
  Wrench,
  SettingsIcon
} from "lucide-react";

const navItems = [
  ["Dashboard", LayoutDashboard],
  ["Vehicles", Truck],
  ["Drivers", User],
  ["Trips", ClipboardList],
  ["Maintenance", Wrench],
  ["Fuel", Fuel],
  ["Expenses", FileText],
  ["Reports", Download],
  ["Settings", SettingsIcon]
];

export default function Sidebar({ auth, page, setPage, logout }) {
  return (
    <aside>
      <div className="brand">
        <div className="logo"><Bus size={22} /></div>
        <div>
          <h1>TransitOps</h1>
          <p>{auth.role}</p>
        </div>
      </div>

      <nav>
        {navItems.map(([label, Icon]) => (
          <button 
            key={label} 
            onClick={() => setPage(label)} 
            className={page === label ? "active" : ""}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sideActions">
        <button onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}