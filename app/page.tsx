
"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface LoginAttempt {
  _id?: string;
  username: string;
  timestamp: string;
  ip: string;
  country: string;
  userAgent: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  status: "success" | "flagged" | "blocked";
}

export default function CredentialStuffingDetector() {
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("password123");
  const [ip, setIp] = useState("102.89.45.67"); // Default Lagos IP
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    const countries = [
      "Nigeria",
      "United States",
      "Russia",
      "China",
      "Germany",
      "India",
    ];
    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ip,
          country: randomCountry,
        }),
      });

      const data = await res.json();

      const newAttempt: LoginAttempt = {
        username,
        timestamp: new Date().toLocaleTimeString(),
        ip,
        country: randomCountry,
        userAgent: navigator.userAgent.slice(0, 60) + "...",
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        reasons: data.reasons || [],
        status: data.status,
      };

      setAttempts((prev) => [newAttempt, ...prev].slice(0, 20));

      if (data.riskScore > 45) {
        setNotification(
          `⚠️ ${data.riskLevel} Risk Detected from ${randomCountry}!`,
        );
        setTimeout(() => setNotification(""), 6000);
      } else {
        setNotification("✅ Login Successful");
        setTimeout(() => setNotification(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setNotification("❌ Error processing login");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateMassAttack = async () => {
    setIsSimulating(true);
    const suspiciousIPs = [
      "185.220.101.45",
      "45.67.89.12",
      "193.34.56.78",
      "91.234.12.45",
    ];

    for (let i = 0; i < 8; i++) {
      const fakeIP =
        suspiciousIPs[Math.floor(Math.random() * suspiciousIPs.length)];
      const countries = ["Russia", "China", "Romania", "Ukraine"];
      const fakeCountry =
        countries[Math.floor(Math.random() * countries.length)];

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: `victim${Math.floor(Math.random() * 999)}`,
            password: "password123",
            ip: fakeIP,
            country: fakeCountry,
          }),
        });

        const data = await res.json();

        const newAttempt: LoginAttempt = {
          username: `victim${Math.floor(Math.random() * 999)}`,
          timestamp: new Date(Date.now() - i * 7000).toLocaleTimeString(),
          ip: fakeIP,
          country: fakeCountry,
          userAgent: "Mozilla/5.0 (compatible; StuffBot/3.1)...",
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          reasons: data.reasons || ["Credential stuffing pattern"],
          status: data.status,
        };

        setAttempts((prev) => [newAttempt, ...prev].slice(0, 20));
      } catch (e) {
        console.error(e);
      }
    }

    setNotification("🚨 MASS CREDENTIAL STUFFING ATTACK SIMULATED!");
    setTimeout(() => setNotification(""), 5000);
    setIsSimulating(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CredentialGuard - Incident Report", 20, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    const tableColumn = [
      "Time",
      "Username",
      "IP",
      "Country",
      "Risk Score",
      "Level",
      "Reasons",
    ];
    const tableRows = attempts.map((a) => [
      a.timestamp,
      a.username,
      a.ip,
      a.country,
      `${a.riskScore}%`,
      a.riskLevel,
      a.reasons.join(", "),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(
      `CredentialGuard_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-zinc-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex justify-between items-center mb-10">
          <div>
            <h1 className="md:text-5xl text-2xl font-bold flex items-center gap-4">
              <Shield className="text-emerald-500" size={52} />
              CredentialGuard
            </h1>
            <p className="text-xl text-gray-400 mt-2 mb-4">
              Advanced Credential Stuffing Detection System
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition"
            >
              <Download size={20} /> Export PDF
            </button>
            <a
              href="/dashboard"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition"
            >
              SOC Dashboard →
            </a>
          </div>
        </div>

        {notification && (
          <div className="mb-8 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center gap-3">
            <AlertTriangle /> {notification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Simulator */}
          <div className="glass rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Users /> Login Simulator (Real Backend)
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Simulated IP Address
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-semibold text-lg transition disabled:opacity-70"
              >
                {isLoading ? "Analyzing Risk..." : "Attempt Login"}
              </button>

              <button
                onClick={simulateMassAttack}
                disabled={isSimulating}
                className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-semibold text-lg transition disabled:opacity-70"
              >
                {isSimulating
                  ? "Simulating Attack..."
                  : "🚨 Simulate Credential Stuffing Attack"}
              </button>
            </div>
          </div>

          {/* Live Detection Feed */}
          <div className="glass rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Live Detection Feed</h2>

            <div className="space-y-4 max-h-[620px] overflow-y-auto custom-scroll">
              {attempts.length === 0 ? (
                <p className="text-gray-500 text-center py-20">
                  No attempts yet. Try logging in.
                </p>
              ) : (
                attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-5"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-mono text-sm text-gray-400">
                          {attempt.ip}
                        </div>
                        <div className="font-semibold mt-1">
                          {attempt.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attempt.country} • {attempt.timestamp}
                        </div>
                      </div>

                      <div
                        className={`px-4 py-1 rounded-xl text-xs font-bold ${
                          attempt.riskLevel === "CRITICAL"
                            ? "bg-red-500/20 text-red-400"
                            : attempt.riskLevel === "HIGH"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {attempt.riskLevel} ({attempt.riskScore}%)
                      </div>
                    </div>

                    {attempt.reasons.length > 0 && (
                      <div className="mt-4 text-sm text-gray-400">
                        {attempt.reasons.map((reason, i) => (
                          <div key={i}>• {reason}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
