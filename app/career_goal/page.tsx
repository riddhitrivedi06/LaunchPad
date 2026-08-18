"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function CareerGoalPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [careerGoal, setCareerGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const careerOptions = [
    "Software Engineer",
    "Data Analyst",
    "Data Scientist",
    "AI / ML Engineer",
    "Web Developer",
    "Other",
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("career_goal")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setCareerGoal(data.career_goal || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!careerGoal) {
      setMessage("Please select a career goal.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        career_goal: careerGoal,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setMessage("Failed to save career goal.");
      setSaving(false);
      return;
    }

    setMessage("Career goal saved successfully! 🎉");

    setSaving(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  if (loading) {
    return (
      <main className="loading">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">

        <div className="header">
          <p className="small-heading">YOUR CAREER JOURNEY</p>

          <h1>Set Your Career Goal 🎯</h1>

          <p className="subtitle">
            Tell LaunchPad what career path you want to pursue.
            We will use this information to personalize your recommendations.
          </p>
        </div>

        <div className="card">

          <h2>What career are you interested in?</h2>

          <p className="description">
            Select the role that best matches your current career goal.
          </p>

          <div className="options">

            {careerOptions.map((option) => (
              <button
                key={option}
                className={`option ${
                  careerGoal === option ? "selected" : ""
                }`}
                onClick={() => setCareerGoal(option)}
              >
                <span>{option}</span>

                {careerGoal === option && (
                  <span className="check">✓</span>
                )}
              </button>
            ))}

          </div>

          {message && (
            <p
              className={
                message.includes("successfully")
                  ? "success"
                  : "error"
              }
            >
              {message}
            </p>
          )}

          <div className="actions">

            <button
              className="secondary-btn"
              onClick={() => router.push("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <button
              className="primary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Career Goal →"}
            </button>

          </div>

        </div>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .container {
          width: 88%;
          max-width: 850px;
          margin: auto;
          padding: 60px 0;
        }

        .header {
          margin-bottom: 30px;
        }

        .small-heading {
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        h1 {
          font-size: 36px;
          margin: 0 0 12px;
        }

        .subtitle {
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
          max-width: 700px;
        }

        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.04);
        }

        .card h2 {
          margin: 0 0 8px;
          font-size: 21px;
        }

        .description {
          color: #64748b;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .option {
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 16px;
          text-align: left;
          font-size: 15px;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.2s;
        }

        .option:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .option.selected {
          border: 2px solid #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .check {
          color: #2563eb;
          font-size: 18px;
          font-weight: bold;
        }

        .success {
          margin-top: 20px;
          color: #15803d;
          font-weight: 600;
        }

        .error {
          margin-top: 20px;
          color: #dc2626;
          font-weight: 600;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          gap: 15px;
        }

        .primary-btn {
          border: none;
          background: #2563eb;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .primary-btn:hover {
          background: #1d4ed8;
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-btn {
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .secondary-btn:hover {
          background: #f8fafc;
        }

        .loading {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
          color: #475569;
          font-family: Arial, Helvetica, sans-serif;
        }

        @media (max-width: 650px) {

          .options {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column-reverse;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }

        }

      `}</style>
    </main>
  );
}