import React from "react";
import {
  Bus,
  ClipboardList,
  Download,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  Truck,
  User,
  Wrench,
  Settings
} from "lucide-react";

export default function Sidebar({ auth, page, setPage, logout }) {
  // Define which roles are allowed to see which tabs
  const navItems = [
    { label: "Dashboard", Icon: LayoutDashboard, roles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"] },
    { label: "Vehicles", Icon: Truck, roles: ["Fleet Manager"] },
    { label: "Drivers", Icon: User, roles: ["Fleet Manager", "Safety Officer"] },
    { label: "Trips", Icon: ClipboardList, roles: ["Fleet Manager", "Driver"] },
    { label: "Maintenance", Icon: Wrench, roles: ["Fleet Manager"] },
    { label: "Fuel", Icon: Fuel, roles: ["Fleet Manager", "Driver", "Financial Analyst"] },
    { label: "Expenses", Icon: FileText, roles: ["Fleet Manager", "Financial Analyst"] },
    { label: "Reports", Icon: Download, roles: ["Fleet Manager", "Financial Analyst"] },
    { label: "Settings", Icon: Settings, roles: ["Fleet Manager"] }
  ];

  // Filter the navigation items based on the current user's role
  const authorizedNav = navItems.filter(item => item.roles.includes(auth.role));

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
        {authorizedNav.map(({ label, Icon }) => (
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