"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResumePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [resumeName, setResumeName] = useState("");
  const [resumePath, setResumePath] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
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
      .select("resume_name, resume_path")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setResumeName(data.resume_name || "");
      setResumePath(data.resume_path || "");
    }

    setLoading(false);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("❌ Please upload a PDF, DOC, or DOCX file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ File size must be less than 5 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const uploadResume = async () => {
    if (!selectedFile) {
      setMessage("❌ Please select a resume first.");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Delete old resume if one exists
      if (resumePath) {
        const { error: deleteError } = await supabase.storage
          .from("resumes")
          .remove([resumePath]);

        if (deleteError) {
          console.error("Old resume delete error:", deleteError);
        }
      }

      // Create unique path for the user's resume
      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "pdf";

      const filePath = `${user.id}/resume-${Date.now()}.${fileExtension}`;

      // Upload new resume
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage(`❌ ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Save file information in profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          resume_name: selectedFile.name,
          resume_path: filePath,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);

        // Remove uploaded file if database update fails
        await supabase.storage
          .from("resumes")
          .remove([filePath]);

        setMessage(`❌ ${updateError.message}`);
        setUploading(false);
        return;
      }

      setResumeName(selectedFile.name);
      setResumePath(filePath);
      setSelectedFile(null);

      setMessage("✅ Resume uploaded successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong while uploading.");
    }

    setUploading(false);
  };

  const deleteResume = async () => {
    if (!resumePath || !user) return;

    setUploading(true);
    setMessage("");

    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([resumePath]);

    if (storageError) {
      console.error(storageError);
      setMessage(`❌ ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        resume_name: null,
        resume_path: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      setMessage(`❌ ${updateError.message}`);
      setUploading(false);
      return;
    }

    setResumeName("");
    setResumePath("");
    setMessage("✅ Resume deleted successfully!");

    setUploading(false);
  };

  const downloadResume = async () => {
    if (!resumePath) return;

    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resumePath, 60);

    if (error) {
      console.error(error);
      setMessage(`❌ ${error.message}`);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  if (loading) {
    return (
      <main className="loading">
        <p>Loading resume section...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">

        <div className="header">
          <p className="small-heading">YOUR CAREER JOURNEY</p>

          <h1>My Resume 📄</h1>

          <p className="subtitle">
            Upload your latest resume so LaunchPad can use it to
            personalize your career recommendations.
          </p>
        </div>

        <div className="card">

          {!resumeName ? (
            <>
              <div className="upload-area">
                <div className="upload-icon">📄</div>

                <h2>Upload your resume</h2>

                <p>
                  PDF, DOC, or DOCX • Maximum size 5 MB
                </p>

                <label className="file-label">
                  Choose Resume

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="selected-file">
                  <span>📎 {selectedFile.name}</span>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="remove-selection"
                  >
                    Remove
                  </button>
                </div>
              )}

              <button
                onClick={uploadResume}
                disabled={!selectedFile || uploading}
                className="primary-btn"
              >
                {uploading ? "Uploading..." : "Upload Resume →"}
              </button>
            </>
          ) : (
            <div className="resume-section">

              <div className="resume-icon">📄</div>

              <div className="resume-info">
                <h2>Resume uploaded</h2>

                <p>{resumeName}</p>
              </div>

              <div className="resume-actions">

                <button
                  onClick={downloadResume}
                  className="secondary-btn"
                >
                  View Resume
                </button>

                <button
                  onClick={deleteResume}
                  disabled={uploading}
                  className="delete-btn"
                >
                  Delete
                </button>

              </div>

              <div className="replace-section">

                <label className="replace-label">
                  Replace Resume

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>

                {selectedFile && (
                  <>
                    <p className="new-file">
                      New file: {selectedFile.name}
                    </p>

                    <button
                      onClick={uploadResume}
                      disabled={uploading}
                      className="primary-btn"
                    >
                      {uploading
                        ? "Uploading..."
                        : "Upload New Resume →"}
                    </button>
                  </>
                )}

              </div>
            </div>
          )}

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

          <div className="back-section">
            <button
              onClick={() => router.push("/dashboard")}
              className="back-btn"
            >
              ← Back to Dashboard
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

        .upload-area {
          text-align: center;
          padding: 45px 20px;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
        }

        .upload-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .upload-area h2 {
          margin-bottom: 8px;
        }

        .upload-area p {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .file-label,
        .replace-label {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          padding: 11px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .file-label input,
        .replace-label input {
          display: none;
        }

        .selected-file {
          margin-top: 20px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #334155;
        }

        .remove-selection {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-weight: 600;
        }

        .primary-btn {
          margin-top: 20px;
          border: none;
          background: #2563eb;
          color: white;
          padding: 12px 20px;
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

        .resume-section {
          padding: 20px 0;
        }

        .resume-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .resume-info h2 {
          margin-bottom: 8px;
        }

        .resume-info p {
          color: #64748b;
          word-break: break-word;
        }

        .resume-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .secondary-btn {
          background: white;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .secondary-btn:hover {
          background: #f8fafc;
        }

        .delete-btn {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .replace-section {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #e2e8f0;
        }

        .new-file {
          color: #475569;
          margin-top: 15px;
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

        .back-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .back-btn {
          background: none;
          border: none;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .back-btn:hover {
          color: #2563eb;
        }

        .loading {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
          color: #475569;
        }

        @media (max-width: 600px) {

          .container {
            width: 92%;
            padding: 40px 0;
          }

          h1 {
            font-size: 30px;
          }

          .selected-file {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .resume-actions {
            flex-direction: column;
          }

        }

      `}</style>
    </main>
  );
}