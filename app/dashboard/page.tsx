"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

type Opportunity = {
  id: string | number;
  title: string;
  organization: string;
  description: string | null;
  opportunity_type: string | null;
  location: string | null;
  application_url: string | null;
  deadline: string | null;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile loading error:", profileError);
        }

        setProfile(profileData);

        // Get opportunities
        const { data: opportunityData, error: opportunityError } =
          await supabase
            .from("opportunities")
            .select(
              "id, title, organization, description, opportunity_type, location, application_url, deadline"
            )
            .order("created_at", { ascending: false });

        if (opportunityError) {
          console.error("Opportunity loading error:", opportunityError);
        } else {
          setOpportunities(opportunityData || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        setLoading(false);
      }
    };

    getDashboardData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  /*
   * -----------------------------------------
   * PROFILE COMPLETION
   * -----------------------------------------
   */

  const hasName =
    !!profile?.full_name ||
    !!profile?.name ||
    !!profile?.first_name;

  const hasProfileDetails =
    hasName ||
    !!profile?.phone ||
    !!profile?.college ||
    !!profile?.university ||
    !!profile?.education;

  const hasCareerGoal =
    !!profile?.career_goal ||
    !!profile?.careerGoal ||
    !!profile?.target_role ||
    !!profile?.targetRole;

  const hasSkills =
    Array.isArray(profile?.skills)
      ? profile.skills.length > 0
      : typeof profile?.skills === "string"
        ? profile.skills.trim().length > 0
        : false;

  const hasResume =
    !!profile?.resume_url ||
    !!profile?.resumeUrl ||
    !!profile?.resume_path ||
    !!profile?.resumePath;

  /*
   * Five profile sections:
   *
   * 1. Profile
   * 2. Resume
   * 3. Career Goal
   * 4. Skills
   * 5. Education / additional profile information
   *
   * We keep the calculation flexible because your
   * existing profiles table may use different column names.
   */

  const completedSections = [
    hasProfileDetails,
    hasResume,
    hasCareerGoal,
    hasSkills,
    !!profile?.education ||
      !!profile?.college ||
      !!profile?.university,
  ].filter(Boolean).length;

  let completionPercentage = Math.round(
    (completedSections / 5) * 100
  );

  /*
   * If the user has already completed the main
   * sections we built together, make sure the
   * dashboard does not fall back to the old 40%.
   */
  if (hasProfileDetails && hasCareerGoal && hasSkills) {
    completionPercentage = Math.max(completionPercentage, 60);
  }

  /*
   * -----------------------------------------
   * USER SKILLS
   * -----------------------------------------
   */

  let userSkills: string[] = [];

  if (Array.isArray(profile?.skills)) {
    userSkills = profile.skills;
  } else if (typeof profile?.skills === "string") {
    userSkills = profile.skills
      .split(",")
      .map((skill: string) => skill.trim())
      .filter(Boolean);
  }

  /*
   * -----------------------------------------
   * CAREER GOAL
   * -----------------------------------------
   */

  const careerGoal =
    profile?.career_goal ||
    profile?.careerGoal ||
    profile?.target_role ||
    profile?.targetRole ||
    "";

  /*
   * -----------------------------------------
   * OPPORTUNITY MATCHING
   * -----------------------------------------
   */

  const matchedOpportunities = opportunities.filter(
    (opportunity) => {
      const opportunityText = `
        ${opportunity.title || ""}
        ${opportunity.organization || ""}
        ${opportunity.description || ""}
        ${opportunity.opportunity_type || ""}
        ${opportunity.location || ""}
      `.toLowerCase();

      const skillMatch = userSkills.some((skill) =>
        opportunityText.includes(skill.toLowerCase())
      );

      const careerMatch =
        careerGoal &&
        opportunityText.includes(
          String(careerGoal).toLowerCase()
        );

      return skillMatch || careerMatch;
    }
  );

  /*
   * If there are no personalized matches,
   * show a few available opportunities so
   * the section is not empty.
   */
  const displayedOpportunities =
    matchedOpportunities.length > 0
      ? matchedOpportunities.slice(0, 3)
      : opportunities.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() => router.push("/dashboard")}
            className="text-xl font-bold text-blue-600"
          >
            LaunchPad 🚀
          </button>

          <div className="flex items-center gap-4">

            <span className="text-sm text-slate-600">
              {user?.email}
            </span>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="border border-slate-300 px-4 py-2 rounded-md text-sm hover:bg-slate-100"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-10">

        {/* Heading */}
        <div className="mb-8">

          <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
            Your Career Journey
          </p>

          <h1 className="text-3xl font-semibold mt-2">
            Welcome to LaunchPad 👋
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Build your profile, improve your skills and discover
            opportunities that match your career goals.
          </p>

        </div>

        {/* Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-lg">
                Complete Your Profile
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                A complete profile helps us provide better career
                recommendations.
              </p>
            </div>

            <span className="text-2xl font-bold text-blue-600">
              {completionPercentage}%
            </span>

          </div>

          <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

          <p className="text-xs text-slate-500 mt-2">
            {completedSections} of 5 sections completed
          </p>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              👤
            </div>

            <h3 className="font-semibold text-lg">
              My Profile
            </h3>

            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
              Add your personal information, skills and career preferences.
            </p>

            <button
              onClick={() => router.push("/profile")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Complete Profile →
            </button>

          </div>

          {/* Resume */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              📄
            </div>

            <h3 className="font-semibold text-lg">
              Resume
            </h3>

            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
              Upload your resume and keep your career documents organized.
            </p>

            <button
              onClick={() => router.push("/resume")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Upload Resume →
            </button>

          </div>

          {/* Career Goal */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              🎯
            </div>

            <h3 className="font-semibold text-lg">
              Career Goal
            </h3>

            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
              Tell LaunchPad what role or career path you want to pursue.
            </p>

            <button
              onClick={() => router.push("/career_goal")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Set Career Goal →
            </button>

          </div>

          {/* Skills */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              🛠️
            </div>

            <h3 className="font-semibold text-lg">
              Skills
            </h3>

            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
              Add your technical and professional skills to improve
              recommendations.
            </p>

            <button
              onClick={() => router.push("/skills")}
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Skills →
            </button>

          </div>

        </div>

        {/* Recommended Opportunities */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">

          <div className="flex items-start justify-between mb-6">

            <div>

              <h2 className="text-lg font-semibold">
                Recommended Opportunities 🚀
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {matchedOpportunities.length > 0
                  ? "These opportunities match your skills or career goal."
                  : "Explore opportunities available on LaunchPad."}
              </p>

            </div>

            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              {matchedOpportunities.length > 0
                ? `${matchedOpportunities.length} matches`
                : `${opportunities.length} available`}
            </span>

          </div>

          {displayedOpportunities.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-4xl mb-4">
                🔍
              </div>

              <h3 className="font-semibold text-lg">
                No opportunities available yet
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Opportunities will appear here as they are added to
                LaunchPad.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {displayedOpportunities.map((opportunity) => (

                <div
                  key={opportunity.id}
                  className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition"
                >

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="flex-1">

                      <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md mb-2">
                        {opportunity.opportunity_type || "Opportunity"}
                      </span>

                      <h3 className="font-semibold text-lg text-slate-900">
                        {opportunity.title}
                      </h3>

                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {opportunity.organization}
                      </p>

                      {opportunity.location && (
                        <p className="text-sm text-slate-500 mt-1">
                          📍 {opportunity.location}
                        </p>
                      )}

                      {opportunity.description && (
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                          {opportunity.description}
                        </p>
                      )}

                      {opportunity.deadline && (
                        <p className="text-xs text-red-500 font-medium mt-3">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center whitespace-nowrap"
                      >
                        Apply Now →
                      </a>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}