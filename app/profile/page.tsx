"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    college: "",
    degree: "",
    branch: "",
    graduation_year: "",
    skills: "",
    about: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
    }

    if (data) {
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        college: data.college || "",
        degree: data.degree || "",
        branch: data.branch || "",
        graduation_year: data.graduation_year
          ? String(data.graduation_year)
          : "",
        skills: data.skills || "",
        about: data.about || "",
      });
    }

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      college: form.college,
      degree: form.degree,
      branch: form.branch,
      graduation_year: form.graduation_year
        ? Number(form.graduation_year)
        : null,
      skills: form.skills,
      about: form.about,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
  console.error("PROFILE SAVE ERROR:", error);
  setMessage(`❌ ${error.message}`);
  return;
}

    setMessage("✅ Profile saved successfully!");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-800 text-base">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xl font-bold text-blue-600"
          >
            LaunchPad 🚀
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-sm font-medium text-gray-700 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Your Career Journey
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            My Profile 👤
          </h1>

          <p className="text-gray-600 mt-2">
            Complete your profile to get better career recommendations.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* COLLEGE */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                College
              </label>

              <input
                type="text"
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="Enter your college"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* DEGREE */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Degree
              </label>

              <input
                type="text"
                name="degree"
                value={form.degree}
                onChange={handleChange}
                placeholder="e.g. BE, BTech"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* BRANCH */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Branch
              </label>

              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* GRADUATION YEAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Graduation Year
              </label>

              <input
                type="number"
                name="graduation_year"
                value={form.graduation_year}
                onChange={handleChange}
                placeholder="e.g. 2028"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* SKILLS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Skills
              </label>

              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. Python, SQL, React, Data Analysis"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="text-xs text-gray-500 mt-2">
                Separate multiple skills with commas.
              </p>
            </div>

            {/* ABOUT */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                About You
              </label>

              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about yourself, your interests and career goals..."
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mt-6 text-sm font-semibold text-gray-800">
              {message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">

            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}