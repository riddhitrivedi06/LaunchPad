"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

const availableSkills = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "HTML",
  "CSS",
  "SQL",
  "MySQL",
  "MongoDB",
  "Power BI",
  "Excel",
  "Data Analysis",
  "Machine Learning",
  "Artificial Intelligence",
  "Git",
  "GitHub",
  "AWS",
];

type Opportunity = {
  id: number;
  title: string;
  organization: string;
  description: string;
  opportunity_type: string;
  location: string;
  application_url: string;
  deadline: string | null;
};

export default function SkillsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    // Load user's saved skills
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("skills")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error loading skills:", profileError);
    }

    if (profileData?.skills) {
      const savedSkills = String(profileData.skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      setSkills(savedSkills);
    } else {
      setSkills([]);
    }

    // Load opportunities
    const { data: opportunityData, error: opportunityError } =
      await supabase
        .from("opportunities")
        .select(
          "id, title, organization, description, opportunity_type, location, application_url, deadline"
        )
        .order("created_at", { ascending: false });

    if (opportunityError) {
      console.error("Error loading opportunities:", opportunityError);
    } else {
      setOpportunities(opportunityData || []);
    }

    setLoading(false);
  };

  const toggleSkill = (skill: string) => {
    setSkills((currentSkills) => {
      if (currentSkills.includes(skill)) {
        return currentSkills.filter((item) => item !== skill);
      }

      return [...currentSkills, skill];
    });

    setMessage("");
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = skills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (!alreadyExists) {
      setSkills((currentSkills) => [...currentSkills, skill]);
    }

    setCustomSkill("");
    setMessage("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const saveSkills = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (skills.length === 0) {
      setMessage("Please select at least one skill.");
      return;
    }

    setSaving(true);
    setMessage("");

    const skillsText = skills.join(", ");

    const { error } = await supabase
      .from("profiles")
      .update({
        skills: skillsText,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Skills save error:", error);
      setMessage(`❌ ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("✅ Skills saved successfully!");

    setSaving(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  // Find opportunities that mention at least one selected skill
  const matchedOpportunities = opportunities.filter((opportunity) => {
    if (skills.length === 0) {
      return false;
    }

    const opportunityText = `
      ${opportunity.title}
      ${opportunity.organization}
      ${opportunity.description}
      ${opportunity.opportunity_type}
    `.toLowerCase();

    return skills.some((skill) =>
      opportunityText.includes(skill.toLowerCase())
    );
  });

  if (loading) {
    return (
      <main className="loading">
        <p>Loading your skills...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}
        <div className="header">
          <p className="small-heading">YOUR CAREER JOURNEY</p>

          <h1>My Skills 💡</h1>

          <p className="subtitle">
            Select the skills you already have. LaunchPad will use them
            to personalize your career recommendations.
          </p>
        </div>

        {/* SKILLS CARD */}
        <div className="card">

          <h2>Select your skills</h2>

          <p className="description">
            Choose all the skills that apply to you.
          </p>

          <div className="skills-grid">
            {availableSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`skill ${
                  skills.includes(skill) ? "selected" : ""
                }`}
                onClick={() => toggleSkill(skill)}
              >
                <span>{skill}</span>

                {skills.includes(skill) && (
                  <span className="check">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* CUSTOM SKILL */}
          <div className="custom-section">

            <h3>Can't find your skill?</h3>

            <div className="custom-input">

              <input
                type="text"
                placeholder="Enter a skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addCustomSkill();
                  }
                }}
              />

              <button
                type="button"
                onClick={addCustomSkill}
                className="add-btn"
              >
                Add
              </button>

            </div>

          </div>

          {/* SELECTED SKILLS */}
          {skills.length > 0 && (
            <div className="selected-section">

              <h3>
                Your selected skills ({skills.length})
              </h3>

              <div className="selected-skills">

                {skills.map((skill) => (
                  <div
                    className="selected-tag"
                    key={skill}
                  >
                    <span>{skill}</span>

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}

              </div>

            </div>
          )}

          {/* MESSAGE */}
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

          {/* ACTIONS */}
          <div className="actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={() => router.push("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={saveSkills}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Skills →"}
            </button>

          </div>

        </div>

        {/* OPPORTUNITIES */}
        <div className="opportunities-card">

          <div className="opportunities-header">
            <div>
              <p className="small-heading">CAREER MATCHES</p>
              <h2>Recommended Opportunities 🚀</h2>

              <p className="description">
                Opportunities that match the skills you selected.
              </p>
            </div>

            <span className="count-badge">
              {matchedOpportunities.length} matches
            </span>
          </div>

          {skills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💡</div>

              <h3>Select your skills first</h3>

              <p>
                Choose one or more skills above to see opportunities
                that match your profile.
              </p>
            </div>
          ) : matchedOpportunities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>

              <h3>No matching opportunities yet</h3>

              <p>
                We couldn't find opportunities matching your selected
                skills. Try adding more skills.
              </p>
            </div>
          ) : (
            <div className="opportunities-list">

              {matchedOpportunities.map((opportunity) => (
                <div
                  className="opportunity"
                  key={opportunity.id}
                >

                  <div className="opportunity-content">

                    <span className="opportunity-type">
                      {opportunity.opportunity_type}
                    </span>

                    <h3>{opportunity.title}</h3>

                    <p className="organization">
                      🏢 {opportunity.organization}
                    </p>

                    <p className="location">
                      📍 {opportunity.location}
                    </p>

                    <p className="opportunity-description">
                      {opportunity.description}
                    </p>

                    {opportunity.deadline && (
                      <p className="deadline">
                        ⏰ Deadline:{" "}
                        {new Date(
                          opportunity.deadline
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                  {opportunity.application_url && (
                    <a
                      href={opportunity.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-btn"
                    >
                      Apply Now →
                    </a>
                  )}

                </div>
              ))}

            </div>
          )}

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
          max-width: 900px;
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

        .card,
        .opportunities-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.04);
        }

        .opportunities-card {
          margin-top: 25px;
        }

        .card h2,
        .opportunities-card h2 {
          margin: 0 0 8px;
          font-size: 21px;
        }

        .description {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .skill {
          background: white;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          border-radius: 9px;
          padding: 13px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          text-align: left;
          transition: 0.2s;
        }

        .skill:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .skill.selected {
          border: 2px solid #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .check {
          color: #2563eb;
          font-weight: bold;
          font-size: 17px;
        }

        .custom-section {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #e2e8f0;
        }

        .custom-section h3,
        .selected-section h3 {
          font-size: 15px;
          margin-bottom: 12px;
        }

        .custom-input {
          display: flex;
          gap: 10px;
        }

        .custom-input input {
          flex: 1;
          padding: 11px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
          background: white;
        }

        .custom-input input:focus {
          border-color: #2563eb;
        }

        .add-btn {
          border: 1px solid #2563eb;
          background: white;
          color: #2563eb;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .add-btn:hover {
          background: #eff6ff;
        }

        .selected-section {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #e2e8f0;
        }

        .selected-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .selected-tag {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 7px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .selected-tag button {
          border: none;
          background: transparent;
          color: #1d4ed8;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          line-height: 1;
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
          gap: 15px;
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #e2e8f0;
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
          opacity: 0.5;
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
          font-weight: 600;
        }

        .secondary-btn:hover {
          background: #f8fafc;
        }

        /* OPPORTUNITIES */

        .opportunities-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .opportunities-header .description {
          margin-bottom: 0;
        }

        .count-badge {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .opportunities-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .opportunity {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          transition: 0.2s;
        }

        .opportunity:hover {
          border-color: #93c5fd;
          box-shadow: 0 3px 12px rgba(37, 99, 235, 0.08);
        }

        .opportunity-content {
          flex: 1;
        }

        .opportunity-type {
          display: inline-block;
          background: #f1f5f9;
          color: #475569;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 9px;
        }

        .opportunity h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #0f172a;
        }

        .organization,
        .location {
          margin: 5px 0;
          color: #475569;
          font-size: 13px;
        }

        .opportunity-description {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin: 12px 0;
        }

        .deadline {
          color: #dc2626;
          font-size: 12px;
          font-weight: 600;
          margin: 8px 0 0;
        }

        .apply-btn {
          display: inline-block;
          background: #2563eb;
          color: white;
          text-decoration: none;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .apply-btn:hover {
          background: #1d4ed8;
        }

        .empty-state {
          text-align: center;
          padding: 45px 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
        }

        .empty-icon {
          font-size: 35px;
          margin-bottom: 10px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 17px;
        }

        .empty-state p {
          color: #64748b;
          font-size: 13px;
          max-width: 500px;
          margin: auto;
          line-height: 1.5;
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

        @media (max-width: 700px) {
          .skills-grid {
            grid-template-columns: 1fr 1fr;
          }

          .opportunity {
            flex-direction: column;
          }

          .apply-btn {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 500px) {
          .skills-grid {
            grid-template-columns: 1fr;
          }

          .custom-input {
            flex-direction: column;
          }

          .add-btn {
            width: 100%;
          }

          .actions {
            flex-direction: column-reverse;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
          }

          .opportunities-header {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}