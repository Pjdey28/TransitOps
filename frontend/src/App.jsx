import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Bus,
  ClipboardList,
  Download,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Truck,
  User,
  Wrench
} from "lucide-react";
import { request } from "./api";

const nav = [
  ["Dashboard", LayoutDashboard],
  ["Vehicles", Truck],
  ["Drivers", User],
  ["Trips", ClipboardList],
  ["Maintenance", Wrench],
  ["Fuel", Fuel],
  ["Expenses", FileText],
  ["Reports", Download]
];

export default function App() {
  const [auth, setAuth] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });
  const [page, setPage] = useState("Dashboard");
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState("");

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(null);
  }

  if (!auth) return <Login setAuth={setAuth} notify={notify} />;

  return (
    <div className={dark ? "app dark" : "app"}>
      <aside>
        <div className="brand">
          <div className="logo"><Bus size={22} /></div>
          <div>
            <h1>TransitOps</h1>
            <p>{auth.role}</p>
          </div>
        </div>

        <nav>
          {nav.map(([label, Icon]) => (
            <button key={label} onClick={() => setPage(label)} className={page === label ? "active" : ""}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sideActions">
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            Theme
          </button>
          <button onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">Smart Transport Operations Platform</p>
            <h2>{page}</h2>
          </div>
          <div className="pill">
            <ShieldCheck size={16} />
            {auth.name}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.section
            key={page}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {page === "Dashboard" && <Dashboard notify={notify} />}
            {page === "Vehicles" && <Vehicles notify={notify} auth={auth} />}
            {page === "Drivers" && <Drivers notify={notify} auth={auth} />}
            {page === "Trips" && <Trips notify={notify} auth={auth} />}
            {page === "Maintenance" && <Maintenance notify={notify} auth={auth} />}
            {page === "Fuel" && <FuelLogs notify={notify} auth={auth} />}
            {page === "Expenses" && <Expenses notify={notify} auth={auth} />}
            {page === "Reports" && <Reports notify={notify} />}
          </motion.section>
        </AnimatePresence>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Login({ setAuth, notify }) {
  const [mode, setMode] = useState("login");
  const emptySignupForm = {
    name: "",
    email: "",
    password: "",
    role: "Fleet Manager"
  };

  const demoLoginForm = {
    name: "",
    email: "fleet@transitops.com",
    password: "password",
    role: "Fleet Manager"
  };

  const [form, setForm] = useState(demoLoginForm);

  const isSignup = mode === "signup";

  async function submit(e) {
    e.preventDefault();

    try {
      const path = isSignup ? "/auth/register" : "/auth/login";

      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data.user);
      notify(isSignup ? "Account created" : "Logged in");
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <div className="login">
      <motion.form
        className="authCard"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        onSubmit={submit}
      >
        <div className="logo big"><Bus /></div>

        <div className="authTitle">
          <p>Smart Transport Operations</p>
          <h1>{isSignup ? "Create account" : "Welcome back"}</h1>
        </div>

        <div className="authSwitch">
          <button
            type="button"
            className={!isSignup ? "selected" : ""}
            onClick={() => {
              setMode("login");
              setForm(demoLoginForm);
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={isSignup ? "selected" : ""}
            onClick={() => {
              setMode("signup");
              setForm(emptySignupForm);
            }}
          >
            Signup
          </button>
        </div>

        {isSignup && (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {isSignup && (
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option>Fleet Manager</option>
            <option>Driver</option>
            <option>Safety Officer</option>
            <option>Financial Analyst</option>
          </select>
        )}

        <button className="authSubmit">
          {isSignup ? "Create account" : "Login"}
        </button>

        {!isSignup && (
          <div className="demoUsers">
            <span>Demo users</span>
            <button type="button" onClick={() => setForm({ ...form, email: "fleet@transitops.com", password: "password" })}>
              Fleet
            </button>
            <button type="button" onClick={() => setForm({ ...form, email: "safety@transitops.com", password: "password" })}>
              Safety
            </button>
            <button type="button" onClick={() => setForm({ ...form, email: "finance@transitops.com", password: "password" })}>
              Finance
            </button>
          </div>
        )}
      </motion.form>
    </div>
  );
}

function Dashboard({ notify }) {
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    Promise.all([request("/dashboard"), request("/vehicles")])
      .then(([dashboard, vehicleRows]) => {
        setData(dashboard);
        setVehicles(vehicleRows);
      })
      .catch((err) => notify(err.message));
  }, []);

  if (!data) return <Empty text="Loading dashboard..." />;

  const pie = ["Available", "On Trip", "In Shop", "Retired"].map((status) => ({
    name: status,
    value: vehicles.filter((v) => v.status === status).length
  }));

  return (
    <>
      <div className="kpis">
        <Kpi title="Active Vehicles" value={data.activeVehicles} />
        <Kpi title="Available Vehicles" value={data.availableVehicles} />
        <Kpi title="In Maintenance" value={data.vehiclesInMaintenance} />
        <Kpi title="Active Trips" value={data.activeTrips} />
        <Kpi title="Pending Trips" value={data.pendingTrips} />
        <Kpi title="Drivers On Duty" value={data.driversOnDuty} />
        <Kpi title="Fleet Utilization" value={`${data.fleetUtilization}%`} />
      </div>

      <div className="two">
        <Card title="Fleet Status">
          <div className="chartWrap">
            <ResponsiveContainer height={280}>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={4}
                  stroke="none"
                >
                  {pie.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#14b8a6", "#6366f1", "#f59e0b", "#ef4444"][i]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="donutCenter">
              <span>Total Fleet</span>
              <strong>{vehicles.length}</strong>
            </div>
          </div>

          <div className="legendGrid">
            {pie.map((item, i) => (
              <div className="legendItem" key={item.name}>
                <span style={{ background: ["#14b8a6", "#6366f1", "#f59e0b", "#ef4444"][i] }} />
                <p>{item.name}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Odometer Overview">
          <div className="chartHeader">
            <p>Total distance covered</p>
            <strong>
              {vehicles.reduce((sum, v) => sum + Number(v.odometer || 0), 0).toLocaleString("en-IN")} km
            </strong>
          </div>

          <ResponsiveContainer height={280}>
            <BarChart data={vehicles} barSize={54}>
              <defs>
                <linearGradient id="odoGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.14)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="odometer"
                fill="url(#odoGradient)"
                radius={[14, 14, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="chartTooltip">
      <span>{label || item.name}</span>
      <strong>{Number(item.value).toLocaleString("en-IN")}</strong>
    </div>
  );
}

function Vehicles({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    regNo: "",
    name: "",
    type: "Van",
    maxLoad: "",
    odometer: "",
    acquisitionCost: "",
    region: "West",
    status: "Available"
  });

  const canEdit = auth.role === "Fleet Manager";

  async function load() {
    setRows(await request("/vehicles"));
  }

  useEffect(() => {
    load().catch((err) => notify(err.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    try {
      await request("/vehicles", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm({ regNo: "", name: "", type: "Van", maxLoad: "", odometer: "", acquisitionCost: "", region: "West", status: "Available" });
      await load();
      notify("Vehicle registered");
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <Card title="Vehicle Registry">
      {canEdit && (
        <Form onSubmit={submit}>
          <Input form={form} setForm={setForm} name="regNo" placeholder="Registration No." />
          <Input form={form} setForm={setForm} name="name" placeholder="Vehicle Name" />
          <Select form={form} setForm={setForm} name="type" options={["Van", "Truck", "Bus"]} />
          <Input form={form} setForm={setForm} name="maxLoad" placeholder="Max Load" type="number" />
          <Input form={form} setForm={setForm} name="odometer" placeholder="Odometer" type="number" />
          <Input form={form} setForm={setForm} name="acquisitionCost" placeholder="Acquisition Cost" type="number" />
          <Select form={form} setForm={setForm} name="region" options={["North", "South", "East", "West"]} />
          <Select form={form} setForm={setForm} name="status" options={["Available", "On Trip", "In Shop", "Retired"]} />
        </Form>
      )}
      <Table rows={rows} fields={["regNo", "name", "type", "maxLoad", "odometer", "region", "status"]} />
    </Card>
  );
}

function Drivers({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    name: "",
    licenseNo: "",
    licenseCategory: "LMV",
    licenseExpiry: "",
    contact: "",
    safetyScore: "",
    status: "Available"
  });

  const canEdit = ["Fleet Manager", "Safety Officer"].includes(auth.role);

  async function load() {
    setRows(await request("/drivers"));
  }

  useEffect(() => {
    load().catch((err) => notify(err.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    try {
      await request("/drivers", {
        method: "POST",
        body: JSON.stringify(form)
      });
      await load();
      notify("Driver added");
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <Card title="Driver Management">
      {canEdit && (
        <Form onSubmit={submit}>
          <Input form={form} setForm={setForm} name="name" placeholder="Name" />
          <Input form={form} setForm={setForm} name="licenseNo" placeholder="License No." />
          <Select form={form} setForm={setForm} name="licenseCategory" options={["LMV", "HMV", "Transport"]} />
          <Input form={form} setForm={setForm} name="licenseExpiry" type="date" />
          <Input form={form} setForm={setForm} name="contact" placeholder="Contact" />
          <Input form={form} setForm={setForm} name="safetyScore" placeholder="Safety Score" type="number" />
          <Select form={form} setForm={setForm} name="status" options={["Available", "On Trip", "Off Duty", "Suspended"]} />
        </Form>
      )}
      <Table rows={rows} fields={["name", "licenseNo", "licenseCategory", "licenseExpiry", "contact", "safetyScore", "status"]} />
    </Card>
  );
}

function Trips({ notify, auth }) {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicle: "",
    driver: "",
    cargoWeight: "",
    plannedDistance: "",
    revenue: ""
  });

  const canEdit = ["Fleet Manager", "Driver"].includes(auth.role);

  async function load() {
    const [t, v, d] = await Promise.all([
      request("/trips"),
      request("/vehicles"),
      request("/drivers")
    ]);
    setTrips(t);
    setVehicles(v);
    setDrivers(d);
  }

  useEffect(() => {
    load().catch((err) => notify(err.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    try {
      await request("/trips", {
        method: "POST",
        body: JSON.stringify(form)
      });
      await load();
      notify("Trip dispatched");
    } catch (err) {
      notify(err.message);
    }
  }

  async function complete(id) {
    const finalOdometer = prompt("Final odometer?");
    const fuelConsumed = prompt("Fuel consumed?");
    if (!finalOdometer) return;

    await request(`/trips/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ finalOdometer, fuelConsumed })
    });

    await load();
    notify("Trip completed");
  }

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter((d) => d.status === "Available");

  return (
    <Card title="Trip Management">
      {canEdit && (
        <Form onSubmit={submit}>
          <Input form={form} setForm={setForm} name="source" placeholder="Source" />
          <Input form={form} setForm={setForm} name="destination" placeholder="Destination" />
          <Select form={form} setForm={setForm} name="vehicle" options={availableVehicles.map((v) => [v._id, `${v.name} - ${v.maxLoad}kg`])} />
          <Select form={form} setForm={setForm} name="driver" options={availableDrivers.map((d) => [d._id, d.name])} />
          <Input form={form} setForm={setForm} name="cargoWeight" placeholder="Cargo Weight" type="number" />
          <Input form={form} setForm={setForm} name="plannedDistance" placeholder="Distance" type="number" />
          <Input form={form} setForm={setForm} name="revenue" placeholder="Revenue" type="number" />
        </Form>
      )}

      <div className="table">
        <div className="row head">
          <span>Route</span><span>Vehicle</span><span>Driver</span><span>Cargo</span><span>Status</span><span>Action</span>
        </div>
        {trips.map((t) => (
          <div className="row" key={t._id}>
            <span>{t.source} to {t.destination}</span>
            <span>{t.vehicle?.name}</span>
            <span>{t.driver?.name}</span>
            <span>{t.cargoWeight} kg</span>
            <span>{t.status}</span>
            <span>{t.status === "Dispatched" && canEdit && <button onClick={() => complete(t._id)}>Complete</button>}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Maintenance({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicle: "", title: "", cost: "", date: "" });

  const canEdit = auth.role === "Fleet Manager";

  async function load() {
    const [m, v] = await Promise.all([request("/maintenance"), request("/vehicles")]);
    setRows(m);
    setVehicles(v);
  }

  useEffect(() => {
    load().catch((err) => notify(err.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    await request("/maintenance", {
      method: "POST",
      body: JSON.stringify(form)
    });

    await load();
    notify("Maintenance started");
  }

  async function close(id) {
    await request(`/maintenance/${id}/close`, { method: "PATCH" });
    await load();
    notify("Maintenance closed");
  }

  return (
    <Card title="Maintenance Workflow">
      {canEdit && (
        <Form onSubmit={submit}>
          <Select form={form} setForm={setForm} name="vehicle" options={vehicles.map((v) => [v._id, v.name])} />
          <Input form={form} setForm={setForm} name="title" placeholder="Service Title" />
          <Input form={form} setForm={setForm} name="cost" placeholder="Cost" type="number" />
          <Input form={form} setForm={setForm} name="date" type="date" />
        </Form>
      )}

      <div className="table">
        <div className="row head">
          <span>Vehicle</span><span>Title</span><span>Cost</span><span>Status</span><span>Action</span>
        </div>
        {rows.map((r) => (
          <div className="row" key={r._id}>
            <span>{r.vehicle?.name}</span>
            <span>{r.title}</span>
            <span>₹{r.cost}</span>
            <span>{r.status}</span>
            <span>{r.status === "Active" && canEdit && <button onClick={() => close(r._id)}>Close</button>}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FuelLogs({ notify, auth }) {
  return <SimpleCreate notify={notify} auth={auth} title="Fuel Logs" listPath="/fuel" createPath="/fuel" fields={["vehicle", "liters", "cost", "distance", "date"]} />;
}

function Expenses({ notify, auth }) {
  return <SimpleCreate notify={notify} auth={auth} title="Expenses" listPath="/expenses" createPath="/expenses" fields={["vehicle", "type", "amount", "date"]} />;
}

function SimpleCreate({ notify, title, listPath, createPath, fields }) {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({});

  async function load() {
    const [items, vehicleRows] = await Promise.all([request(listPath), request("/vehicles")]);
    setRows(items);
    setVehicles(vehicleRows);
  }

  useEffect(() => {
    load().catch((err) => notify(err.message));
  }, []);

  async function submit(e) {
    e.preventDefault();

    await request(createPath, {
      method: "POST",
      body: JSON.stringify(form)
    });

    await load();
    notify(`${title} saved`);
  }

  return (
    <Card title={title}>
      <Form onSubmit={submit}>
        {fields.map((field) =>
          field === "vehicle" ? (
            <Select key={field} form={form} setForm={setForm} name={field} options={vehicles.map((v) => [v._id, v.name])} />
          ) : field === "date" ? (
            <Input key={field} form={form} setForm={setForm} name={field} type="date" />
          ) : (
            <Input key={field} form={form} setForm={setForm} name={field} placeholder={field} />
          )
        )}
      </Form>
      <Table rows={rows.map((r) => ({ ...r, vehicle: r.vehicle?.name }))} fields={fields} />
    </Card>
  );
}

function Reports({ notify }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    request("/reports")
      .then(setRows)
      .catch((err) => notify(err.message));
  }, []);

  function exportCsv() {
    const headers = ["vehicle", "regNo", "fuelEfficiency", "operationalCost", "roi"];
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "transitops-report.csv";
    a.click();
  }

  return (
    <Card title="Reports & Analytics">
      <div className="actions">
        <button onClick={exportCsv}><Download size={16} /> Export CSV</button>
        <button onClick={() => window.print()}><FileText size={16} /> Export PDF</button>
      </div>
      <Table rows={rows} fields={["vehicle", "regNo", "fuelEfficiency", "operationalCost", "roi"]} />
    </Card>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <motion.div className="card kpi" whileHover={{ y: -4 }}>
      <p>{title}</p>
      <strong>{value}</strong>
    </motion.div>
  );
}

function Form({ children, onSubmit }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
      <button><Plus size={16} /> Save</button>
    </form>
  );
}

function Input({ form, setForm, name, ...props }) {
  return (
    <input
      required
      value={form[name] || ""}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      {...props}
    />
  );
}

function Select({ form, setForm, name, options }) {
  return (
    <select required value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })}>
      <option value="">Select {name}</option>
      {options.map((option) =>
        Array.isArray(option)
          ? <option key={option[0]} value={option[0]}>{option[1]}</option>
          : <option key={option} value={option}>{option}</option>
      )}
    </select>
  );
}

function Table({ rows, fields }) {
  if (!rows.length) return <Empty text="No records found." />;

  return (
    <div className="table">
      <div className="row head">
        {fields.map((field) => <span key={field}>{field}</span>)}
      </div>
      {rows.map((row) => (
        <div className="row" key={row._id || row.regNo || row.vehicle}>
          {fields.map((field) => (
            <span key={field}>{format(row[field])}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return <p className="muted">{text}</p>;
}

function format(value) {
  if (!value) return "-";
  if (String(value).includes("T00:00:00")) return String(value).slice(0, 10);
  return String(value);
}