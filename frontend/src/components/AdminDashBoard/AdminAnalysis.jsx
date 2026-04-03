import React, { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import API from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminAnalysis.css";

const getArrayFromResponse = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const safeIsoDay = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const buildLastNDays = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const sortDesc = (a, b) => b.value - a.value;

export default function AdminAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [managedItems, setManagedItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [locations, setLocations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      API.get("/api/lost"),
      API.get("/api/found"),
      API.get("/api/lostfound/items"),
      API.get("/api/smart-match/all-matches"),
      API.get("/api/help"),
      API.get("/api/locations"),
      API.get("/api/feedback/"),
    ]);

    const [lostRes, foundRes, managedRes, matchesRes, helpRes, locationsRes, feedbackRes] =
      results;

    const nextErrors = [];

    if (lostRes.status === "fulfilled") {
      setLostItems(getArrayFromResponse(lostRes.value.data, ["lostItems", "items", "data"]));
    } else {
      setLostItems([]);
      nextErrors.push("Lost items");
    }

    if (foundRes.status === "fulfilled") {
      setFoundItems(getArrayFromResponse(foundRes.value.data, ["foundItems", "items", "data"]));
    } else {
      setFoundItems([]);
      nextErrors.push("Found items");
    }

    if (managedRes.status === "fulfilled") {
      setManagedItems(getArrayFromResponse(managedRes.value.data, ["items", "data"]));
    } else {
      setManagedItems([]);
      nextErrors.push("Managed items");
    }

    if (matchesRes.status === "fulfilled") {
      setMatches(getArrayFromResponse(matchesRes.value.data, ["matches", "data"]));
    } else {
      setMatches([]);
      nextErrors.push("Smart matching");
    }

    if (helpRes.status === "fulfilled") {
      setHelpRequests(getArrayFromResponse(helpRes.value.data, ["items", "data"]));
    } else {
      setHelpRequests([]);
      nextErrors.push("Help requests");
    }

    if (locationsRes.status === "fulfilled") {
      setLocations(getArrayFromResponse(locationsRes.value.data, ["locations", "items", "data"]));
    } else {
      setLocations([]);
      nextErrors.push("Locations");
    }

    if (feedbackRes.status === "fulfilled") {
      const data = feedbackRes.value.data;
      setFeedbacks(getArrayFromResponse(data, ["feedbacks", "items", "data"]));
    } else {
      // Backend returns 404 when empty; treat that as "no feedback".
      const status = feedbackRes.reason?.response?.status;
      if (status === 404) {
        setFeedbacks([]);
      } else {
        setFeedbacks([]);
        nextErrors.push("Feedback");
      }
    }

    if (nextErrors.length > 0) {
      setError(`Some data could not be loaded: ${nextErrors.join(", ")}.`);
    }

    setLastUpdatedAt(new Date());
    setLoading(false);
  }, []);

  // Load once (on first render)
  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const kpis = useMemo(() => {
    const managedPending = managedItems.filter((x) => (x?.status || "").toLowerCase() === "pending").length;
    const matchPending = matches.filter((m) => m?.status === "pending").length;
    const helpOpen = helpRequests.filter((x) => x?.status === "OPEN").length;

    return [
      { label: "Lost reports", value: lostItems.length, accent: "amber" },
      { label: "Found reports", value: foundItems.length, accent: "muted" },
      { label: "Managed items", value: managedItems.length, sub: `${managedPending} pending`, accent: "amber" },
      { label: "Matches", value: matches.length, sub: `${matchPending} pending`, accent: "muted" },
      { label: "Help requests", value: helpRequests.length, sub: `${helpOpen} open`, accent: "amber" },
      { label: "Locations", value: locations.length, accent: "muted" },
    ];
  }, [foundItems.length, helpRequests, locations.length, lostItems.length, managedItems, matches]);

  const lostFoundTrend = useMemo(() => {
    const days = buildLastNDays(14);
    const lostByDay = new Map();
    const foundByDay = new Map();

    for (const day of days) {
      lostByDay.set(day, 0);
      foundByDay.set(day, 0);
    }

    for (const x of lostItems) {
      const day = safeIsoDay(x?.createdAt || x?.dateTime);
      if (day && lostByDay.has(day)) lostByDay.set(day, (lostByDay.get(day) || 0) + 1);
    }

    for (const x of foundItems) {
      const day = safeIsoDay(x?.createdAt || x?.dateTime);
      if (day && foundByDay.has(day)) foundByDay.set(day, (foundByDay.get(day) || 0) + 1);
    }

    return days.map((day) => ({
      day: day.slice(5),
      lost: lostByDay.get(day) || 0,
      found: foundByDay.get(day) || 0,
    }));
  }, [foundItems, lostItems]);

  const categoryBars = useMemo(() => {
    const map = new Map();

    const add = (category, kind) => {
      const key = (category || "Unknown").trim() || "Unknown";
      const cur = map.get(key) || { category: key, lost: 0, found: 0, total: 0 };
      cur[kind] += 1;
      cur.total += 1;
      map.set(key, cur);
    };

    for (const x of lostItems) add(x?.category, "lost");
    for (const x of foundItems) add(x?.category, "found");

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map(({ category, lost, found }) => ({ category, lost, found }));
  }, [foundItems, lostItems]);

  const matchStatusBars = useMemo(() => {
    const counts = { pending: 0, notified: 0, resolved: 0 };
    for (const m of matches) {
      const key = m?.status;
      if (key && Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
    }
    return [
      { status: "Pending", value: counts.pending },
      { status: "Notified", value: counts.notified },
      { status: "Resolved", value: counts.resolved },
    ];
  }, [matches]);

  const managedStatusBars = useMemo(() => {
    const counts = { pending: 0, claimed: 0, returned: 0 };
    for (const x of managedItems) {
      const key = String(x?.status || "").toLowerCase();
      if (key && Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
    }
    return [
      { status: "Pending", value: counts.pending },
      { status: "Claimed", value: counts.claimed },
      { status: "Returned", value: counts.returned },
    ];
  }, [managedItems]);

  const helpStatusPie = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    for (const x of helpRequests) {
      const key = x?.status;
      if (key && Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
    }

    return [
      { name: "OPEN", value: counts.OPEN },
      { name: "IN_PROGRESS", value: counts.IN_PROGRESS },
      { name: "RESOLVED", value: counts.RESOLVED },
    ].sort(sortDesc);
  }, [helpRequests]);

  const feedbackBySection = useMemo(() => {
    const map = new Map();
    for (const f of feedbacks) {
      const key = (f?.section || "Unknown").trim() || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([section, value]) => ({ section, value }))
      .sort(sortDesc)
      .slice(0, 8);
  }, [feedbacks]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) return "—";
    return lastUpdatedAt.toLocaleString();
  }, [lastUpdatedAt]);

  return (
    <AdminLayout
      title="Analysis"
      subtitle="Operational insights across MatchMate modules"
      actions={
        <button className="admin-btn admin-btn--primary" onClick={fetchAll} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      }
    >
      <div className="aa-top">
        <div className="aa-meta">
          <span className="aa-meta-chip">Last updated: {lastUpdatedLabel}</span>
          {error ? <span className="aa-meta-warn">{error}</span> : null}
        </div>

        <div className="aa-kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className={`aa-kpi aa-kpi--${k.accent}`}>
              <div className="aa-kpi-label">{k.label}</div>
              <div className="aa-kpi-value">{k.value}</div>
              {k.sub ? <div className="aa-kpi-sub">{k.sub}</div> : <div className="aa-kpi-sub">&nbsp;</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="aa-grid">
        <div className="admin-card aa-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Lost vs Found (last 14 days)</h3>
            <span className="aa-card-meta">Submissions per day</span>
          </div>
          <div className="admin-card-body">
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lostFoundTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 23, 48, 0.95)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "rgba(248,250,252,0.82)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="lost" stroke="var(--amber)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="found" stroke="rgba(248,250,252,0.55)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="admin-card aa-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Category distribution</h3>
            <span className="aa-card-meta">Top categories</span>
          </div>
          <div className="admin-card-body">
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="category" stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 23, 48, 0.95)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "rgba(248,250,252,0.82)", fontSize: 12 }} />
                  <Bar dataKey="lost" fill="var(--amber)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="found" fill="rgba(248,250,252,0.40)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="admin-card aa-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Help request status</h3>
            <span className="aa-card-meta">OPEN / IN_PROGRESS / RESOLVED</span>
          </div>
          <div className="admin-card-body">
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 23, 48, 0.95)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Pie
                    data={helpStatusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    innerRadius={58}
                    paddingAngle={2}
                  >
                    {helpStatusPie.map((entry) => {
                      const fill =
                        entry.name === "OPEN"
                          ? "var(--amber)"
                          : entry.name === "IN_PROGRESS"
                          ? "rgba(248,250,252,0.55)"
                          : "rgba(248,250,252,0.28)";
                      return <Cell key={entry.name} fill={fill} stroke="rgba(255,255,255,0.10)" />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="aa-legend-row">
              <span className="aa-dot aa-dot--amber" /> OPEN
              <span className="aa-dot aa-dot--ink2" /> IN_PROGRESS
              <span className="aa-dot aa-dot--ink3" /> RESOLVED
            </div>
          </div>
        </div>

        <div className="admin-card aa-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Matches by status</h3>
            <span className="aa-card-meta">Pending / Notified / Resolved</span>
          </div>
          <div className="admin-card-body">
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={matchStatusBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="status" stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 23, 48, 0.95)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="value" fill="var(--amber)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="admin-card aa-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Managed item status</h3>
            <span className="aa-card-meta">Pending / Claimed / Returned</span>
          </div>
          <div className="admin-card-body">
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={managedStatusBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="status" stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(12, 23, 48, 0.95)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="value" fill="rgba(248,250,252,0.40)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="admin-card aa-card aa-card--wide">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Feedback by section</h3>
            <span className="aa-card-meta">Top sections (count)</span>
          </div>
          <div className="admin-card-body">
            {feedbackBySection.length === 0 ? (
              <p className="aa-empty">No feedback data available.</p>
            ) : (
              <div className="aa-chart">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={feedbackBySection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                    <XAxis dataKey="section" stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="rgba(248,250,252,0.60)" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(12, 23, 48, 0.95)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 12,
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="value" fill="rgba(248,250,252,0.40)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
