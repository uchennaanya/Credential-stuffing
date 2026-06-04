"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

interface LoginAttempt {
  _id: string;
  username: string;
  ip: string;
  country: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  status: string;
  createdAt: string;
}

export default function SOCDashboard() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [blocked, setBlocked] = useState(0);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attempts");
      const data = await res.json();

      setAttempts(data.attempts || []);
      setTotalAttempts(data.total || 0);
      setBlocked(data.blocked || 0);
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
    const interval = setInterval(fetchAttempts, 10000);
    return () => clearInterval(interval);
  }, []);

  const attackTrend = [
    { time: "00:00", attempts: 45, blocked: 12 },
    { time: "04:00", attempts: 67, blocked: 28 },
    { time: "08:00", attempts: 134, blocked: 45 },
    { time: "12:00", attempts: 98, blocked: 33 },
    { time: "16:00", attempts: 156, blocked: 67 },
    { time: "20:00", attempts: 89, blocked: 41 },
  ];

  const countryData = [
    { name: "Nigeria", value: 42, color: "#10b981" },
    { name: "Russia", value: 28, color: "#ef4444" },
    { name: "China", value: 19, color: "#f59e0b" },
    { name: "Others", value: 11, color: "#8b5cf6" },
  ];

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CredentialGuard - SOC Incident Report", 20, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Total Records: ${totalAttempts} | Blocked: ${blocked}`, 20, 38);

    const tableColumn = [
      "Time",
      "Username",
      "IP",
      "Country",
      "Risk Score",
      "Level",
      "Status",
      "Reasons",
    ];
    const tableRows = attempts.map((a) => [
      new Date(a.createdAt).toLocaleString(),
      a.username,
      a.ip,
      a.country,
      `${a.riskScore}%`,
      a.riskLevel,
      a.status.toUpperCase(),
      (a.reasons || []).join(", "),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(
      `CredentialGuard_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Shield className="text-emerald-500" size={48} />
            <div>
              <h1 className="text-4xl font-bold">SOC Dashboard</h1>
              <p className="text-gray-400">
                Real-time Credential Stuffing Detection
              </p>
            </div>
          </div>

          <div className="flex md:flex-row flex-col gap-4 mt-2 text-center">
            <button
              onClick={fetchAttempts}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl"
            >
              <RefreshCw size={18} /> Refresh
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl"
            >
              <Download size={20} /> Export PDF
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200"
            >
              ← Login Simulator
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Total Attempts</p>
            <p className="text-4xl font-bold mt-2">{totalAttempts}</p>
          </div>
          <div className="glass rounded-3xl p-6 border border-red-500/30">
            <p className="text-gray-400 text-sm">Blocked Attacks</p>
            <p className="text-4xl font-bold mt-2 text-red-400">{blocked}</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Detection Rate</p>
            <p className="text-4xl font-bold mt-2 text-emerald-400">87%</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Active Threats</p>
            <p className="text-4xl font-bold mt-2 text-orange-400">3</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 glass rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-6">
              Attack Trend (24 Hours)
            </h3>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={attackTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attempts"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-3xl p-8">
            <h3 className="text-xl font-semibold mb-6">
              Attack Sources by Country
            </h3>
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="glass rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <AlertTriangle className="text-red-400" /> Live Suspicious
              Activity
            </h3>
            <span className="text-sm text-gray-400">
              {attempts.length} records
            </span>
          </div>

          <div className="space-y-4 max-h-[520px] overflow-y-auto custom-scroll">
            {loading ? (
              <p className="text-center py-20 text-gray-500">
                Loading data from MongoDB...
              </p>
            ) : attempts.length > 0 ? (
              attempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="bg-zinc-900/70 border border-red-500/20 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-red-400">{attempt.ip}</div>
                      <div className="font-semibold text-lg">
                        {attempt.username}
                      </div>
                      <div className="text-sm text-gray-400">
                        {attempt.country} •{" "}
                        {new Date(attempt.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-400">
                        {attempt.riskScore}%
                      </div>
                      <div className="text-xs uppercase tracking-widest text-red-400">
                        {attempt.riskLevel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    {(attempt.reasons || []).map((reason, i) => (
                      <div key={i}>• {reason}</div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-20 text-gray-500">
                No attempts recorded yet. Use the Login Simulator first.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
