"use client";

import { useState, useEffect } from "react";

type Project = {
  id: string;
  label: string;
  sub: string;
  color: string;
  icon: string;
  deadline?: boolean;
};

const PROJECTS: Project[] = [
  { id: "album",    label: "TOWER HAMLETS",    sub: "Electronic Album", color: "#C8FF00", icon: "▣" },
  { id: "ep",       label: "SINGER-SONGWRITER", sub: "EP — 5 Songs",    color: "#F0EAD6", icon: "◎" },
  { id: "drawings", label: "DRAWINGS",          sub: "Due June",        color: "#FF6A3C", icon: "◈", deadline: true },
  { id: "zine",     label: "ZINE",              sub: "Ship to unlock",  color: "#7EC8A0", icon: "◉" },
];

const DAYS = [
  { id: "mon", label: "MON", slots: 2 },
  { id: "wed", label: "WED", slots: 2 },
  { id: "fri", label: "FRI", slots: 2 },
  { id: "sat", label: "SAT", slots: 2 },
  { id: "sun", label: "SUN", slots: 1 },
];

const TOTAL = 9;
const NOTE_KEY = "st-weekly-note";

type Vitality = "high" | "low" | "none";

function getVitality(count: number): Vitality {
  if (count >= 2) return "high";
  if (count === 1) return "low";
  return "none";
}

type VitalityStyles = {
  iconColor: string;
  iconBg: string;
  labelColor: string;
  borderColor: string;
  borderWidth: number;
  glow: string;
  dotColor: string;
  dotSize: number;
  dotGlow: string;
  stateLabel: string;
  stateLabelColor: string;
  countColor: string;
  countGlow: string;
};

function vitalityStyles(vitality: Vitality, color: string): VitalityStyles {
  if (vitality === "high") return {
    iconColor: color,
    iconBg: `${color}18`,
    labelColor: "#F0EDE8",
    borderColor: color,
    borderWidth: 2,
    glow: `0 0 12px ${color}55`,
    dotColor: color,
    dotSize: 7,
    dotGlow: `0 0 6px ${color}88`,
    stateLabel: "VITAL",
    stateLabelColor: "#A0C060",
    countColor: color,
    countGlow: `0 0 20px ${color}44`,
  };
  if (vitality === "low") return {
    iconColor: "#D4A84A",
    iconBg: "#2A2010",
    labelColor: "#D4A84A",
    borderColor: "#A07830",
    borderWidth: 2,
    glow: "none",
    dotColor: "#D4A84A",
    dotSize: 5,
    dotGlow: "none",
    stateLabel: "TENDING",
    stateLabelColor: "#A07830",
    countColor: "#D4A84A",
    countGlow: "none",
  };
  return {
    iconColor: "#7AA8C8",
    iconBg: "#0E1E28",
    labelColor: "#7AA8C8",
    borderColor: "#3A5A6E",
    borderWidth: 1,
    glow: "none",
    dotColor: "#4A7A98",
    dotSize: 4,
    dotGlow: "none",
    stateLabel: "READY",
    stateLabelColor: "#6A98B8",
    countColor: "#5A88A8",
    countGlow: "none",
  };
}

function getWeekKey(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(now.setDate(diff));
  return `st-v10-${m.getFullYear()}-${m.getMonth()}-${m.getDate()}`;
}

type Sessions = Record<string, string>;

export default function StudioTracker() {
  // Hydration-safe: start empty on server, load from localStorage after mount
  const [weekKey, setWeekKey] = useState<string>("");
  const [sessions, setSessions] = useState<Sessions>({});
  const [note, setNote] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [newWeekHover, setNewWeekHover] = useState(false);

  // Load from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const wk = getWeekKey();
    setWeekKey(wk);
    try {
      const s = localStorage.getItem(wk);
      if (s) setSessions(JSON.parse(s));
    } catch {}
    try {
      const n = localStorage.getItem(NOTE_KEY);
      if (n) setNote(n);
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !weekKey) return;
    try { localStorage.setItem(weekKey, JSON.stringify(sessions)); } catch {}
  }, [sessions, weekKey, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(NOTE_KEY, note); } catch {}
  }, [note, mounted]);

  const total = Object.keys(sessions).length;
  const counts = PROJECTS.reduce<Record<string, number>>((a, p) => {
    a[p.id] = Object.values(sessions).filter(s => s === p.id).length;
    return a;
  }, {});
  const complete = total >= TOTAL;

  const toggle = (dayId: string, slot: number, pid: string) => {
    const key = `${dayId}-${slot}`;
    setSessions(prev => {
      const next = { ...prev };
      if (next[key] === pid) delete next[key];
      else next[key] = pid;
      return next;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1A1916",
      color: "#F0EDE8",
      fontFamily: "'Courier New', monospace",
      padding: "32px 22px 60px",
      boxSizing: "border-box",
    }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: "2px solid #3A3A2E" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.44em", color: "#A09880", marginBottom: 14 }}>
          STUDIO PRACTICE · WEEK
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
          <span style={{
            fontSize: 88, fontWeight: "bold", lineHeight: 0.85, letterSpacing: "-0.03em",
            color: complete ? "#C8FF00" : "#F0EDE8",
            transition: "color 0.4s",
            textShadow: complete ? "0 0 48px rgba(200,255,0,0.35)" : "none",
          }}>
            {total}
          </span>
          <span style={{ fontSize: 30, color: "#908070", alignSelf: "center", fontWeight: "bold" }}>
            / {TOTAL}
          </span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.32em", color: "#908070", marginBottom: 16 }}>
          SESSIONS · 15 MIN MINIMUM
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 7,
              background: i < total ? (complete ? "#C8FF00" : "#A09880") : "#2E2C24",
              transition: "background 0.3s",
            }}/>
          ))}
        </div>
      </div>

      {/* ── WEEKLY NOTE ── */}
      <div style={{
        marginBottom: 28, padding: "14px 16px",
        background: "#201E18", borderLeft: "3px solid #7A7048",
        cursor: editingNote ? "default" : "pointer",
      }}
        onClick={() => { if (!editingNote) { setNoteDraft(note); setEditingNote(true); } }}
      >
        <div style={{ fontSize: 11, letterSpacing: "0.38em", color: "#A89060", marginBottom: 8 }}>
          THIS WEEK
        </div>
        {editingNote ? (
          <div>
            <textarea
              autoFocus
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="OPEN SOMETHING. MAGIC FOLLOWS."
              rows={2}
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                color: "#F0EDE8", fontFamily: "'Courier New', monospace",
                fontSize: 14, lineHeight: 1.7, resize: "none", letterSpacing: "0.04em",
                boxSizing: "border-box", padding: 0,
              }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button onClick={e => { e.stopPropagation(); setNote(noteDraft); setEditingNote(false); }}
                style={{
                  background: "none", border: "1px solid #7A7048", color: "#D4B870",
                  fontSize: 11, letterSpacing: "0.28em", padding: "6px 12px",
                  cursor: "pointer", fontFamily: "'Courier New', monospace",
                }}>SET</button>
              <button onClick={e => { e.stopPropagation(); setEditingNote(false); }}
                style={{
                  background: "none", border: "none", color: "#808070",
                  fontSize: 11, letterSpacing: "0.28em", padding: "6px 0",
                  cursor: "pointer", fontFamily: "'Courier New', monospace",
                }}>CANCEL</button>
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: 14, lineHeight: 1.7, letterSpacing: "0.04em",
            color: note ? "#D4C890" : "#787060",
          }}>
            {note || "OPEN SOMETHING. MAGIC FOLLOWS."}
          </div>
        )}
      </div>

      {/* ── DAY ROWS ── */}
      <div style={{ marginBottom: 40 }}>
        {DAYS.map((day, di) => (
          <div key={day.id} style={{
            display: "flex", alignItems: "center", gap: 16,
            paddingBottom: 14, marginBottom: 14,
            borderBottom: di < DAYS.length - 1 ? "1px solid #2A2820" : "none",
          }}>
            <div style={{
              width: 36, fontSize: 12, fontWeight: "bold",
              letterSpacing: "0.18em", color: "#A09880", flexShrink: 0,
            }}>
              {day.label}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {Array.from({ length: day.slots }).map((_, i) => {
                const key = `${day.id}-${i}`;
                const assigned = PROJECTS.find(p => p.id === sessions[key]);
                return (
                  <Slot key={key} assigned={assigned} projects={PROJECTS}
                    onSelect={pid => toggle(day.id, i, pid)} />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── PROJECTS / VITALITY ── */}
      <div style={{ borderTop: "2px solid #3A3A2E", paddingTop: 28, marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.42em", color: "#A09880", marginBottom: 24 }}>
          PROJECTS
        </div>
        {PROJECTS.map(p => {
          const vitality = getVitality(counts[p.id]);
          const vs = vitalityStyles(vitality, p.color);
          return (
            <div key={p.id} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 22,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    border: `${vs.borderWidth}px solid ${vs.borderColor}`,
                    background: vs.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: vs.iconColor,
                    boxShadow: vs.glow, transition: "all 0.4s",
                  }}>
                    {p.icon}
                  </div>
                  <div style={{
                    width: vs.dotSize, height: vs.dotSize, borderRadius: "50%",
                    background: vs.dotColor, boxShadow: vs.dotGlow,
                    transition: "all 0.4s",
                  }}/>
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: "bold", letterSpacing: "0.12em",
                    color: vs.labelColor, transition: "color 0.4s",
                  }}>
                    {p.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: "#808070", letterSpacing: "0.1em" }}>{p.sub}</span>
                    {p.deadline && (
                      <span style={{
                        fontSize: 11, letterSpacing: "0.2em",
                        color: "#C89040", border: "1px solid #8A6428",
                        padding: "1px 5px", background: "#201808",
                      }}>JUNE</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11, letterSpacing: "0.28em", marginTop: 4,
                    color: vs.stateLabelColor, transition: "color 0.4s",
                  }}>
                    {vs.stateLabel}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 42, fontWeight: "bold", letterSpacing: "-0.03em",
                color: vs.countColor, transition: "color 0.4s",
                textShadow: vs.countGlow,
                minWidth: 36, textAlign: "right",
              }}>
                {counts[p.id]}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DOCTRINE ── */}
      <div style={{
        fontSize: 11, letterSpacing: "0.24em", color: "#808070",
        lineHeight: 2.6, marginBottom: 28,
        borderTop: "1px solid #2A2820", paddingTop: 22,
      }}>
        EVERY MEDIUM TOUCHED EACH WEEK<br/>
        OPEN SOMETHING · ALL OUTPUT IS VALID<br/>
        SHOW UP · THAT&apos;S ENOUGH
      </div>

      {/* ── NEW WEEK BUTTON ── */}
      <button
        onClick={() => setSessions({})}
        onMouseEnter={() => setNewWeekHover(true)}
        onMouseLeave={() => setNewWeekHover(false)}
        style={{
          background: newWeekHover ? "#1A2E38" : "none",
          border: `1px solid ${newWeekHover ? "#7AA8C8" : "#4A6A7A"}`,
          color: newWeekHover ? "#9AC8E0" : "#6A9AB0",
          fontSize: 11, letterSpacing: "0.3em",
          padding: "10px 18px", cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          transition: "all 0.2s",
        }}
      >
        NEW WEEK
      </button>

    </div>
  );
}

type SlotProps = {
  assigned: Project | undefined;
  projects: Project[];
  onSelect: (pid: string) => void;
};

function Slot({ assigned, projects, onSelect }: SlotProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 64, height: 64,
          border: assigned ? `2px solid ${assigned.color}` : "2px solid #3A3830",
          background: assigned ? `${assigned.color}1A` : "#201E18",
          cursor: "pointer", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 5,
          transition: "all 0.15s",
          boxShadow: assigned ? `0 0 14px ${assigned.color}33` : "none",
        }}
      >
        {assigned ? (
          <>
            <div style={{ fontSize: 22, color: assigned.color, lineHeight: 1 }}>{assigned.icon}</div>
            <div style={{ fontSize: 11, color: assigned.color, letterSpacing: "0.12em", fontWeight: "bold" }}>
              {assigned.label.split(" ")[0].slice(0, 5)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 26, color: "#787060", lineHeight: 1, fontWeight: "bold" }}>+</div>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }}/>
          <div style={{
            position: "absolute", top: 70, left: 0, zIndex: 100,
            background: "#201E18", border: "2px solid #3A3830",
            minWidth: 240, boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
          }}>
            {projects.map((p, i) => (
              <button key={p.id}
                onClick={() => { onSelect(p.id); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "14px 16px",
                  background: assigned?.id === p.id ? "#2E2C24" : "none",
                  border: "none",
                  borderBottom: i < projects.length - 1 ? "1px solid #2E2C24" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 7, height: 7, background: p.color, flexShrink: 0 }}/>
                <span style={{
                  fontSize: 12, fontWeight: "bold", color: "#F0EDE8",
                  letterSpacing: "0.16em", fontFamily: "'Courier New', monospace",
                  whiteSpace: "nowrap",
                }}>
                  {p.label}
                </span>
              </button>
            ))}
            {assigned && (
              <button
                onClick={() => { onSelect(assigned.id); setOpen(false); }}
                style={{
                  display: "block", width: "100%", padding: "10px 16px",
                  background: "none", border: "none", borderTop: "1px solid #2E2C24",
                  cursor: "pointer", textAlign: "left",
                  fontSize: 11, color: "#A09880", letterSpacing: "0.22em",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                CLEAR SLOT
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
