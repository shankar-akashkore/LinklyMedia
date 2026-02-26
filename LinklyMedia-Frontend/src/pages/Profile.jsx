import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const res = await fetch("http://localhost:8000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          setFormData(data.user);
        } else {
          setError("Failed to load profile.");
        }
      } catch (err) {
        setError("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setSuccess(false);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      const res = await fetch("http://localhost:8000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = data.user ?? data;
        setUser(updatedUser);
        setFormData(updatedUser);
        setEditMode(false);
        setSuccess(true);
      } else {
        setError(data?.error || "Update failed");
      }
    } catch (err) {
      setError("Update error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#507c88]/10 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-40 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#507c88]/10 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 shadow-xl p-5 sm:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              My Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal details
            </p>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-full sm:w-auto bg-[#507c88] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#3d6370] transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto bg-[#507c88] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#3d6370] transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(user || {});
                  setError(null);
                  setSuccess(false);
                }}
                className="w-full sm:w-auto border border-gray-200 px-6 py-2.5 rounded-full text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            Profile updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname || ""}
              onChange={handleChange}
              disabled={!editMode}
              className={`mt-1 w-full border rounded-lg px-3 py-2.5 text-sm ${
                editMode
                  ? "bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
                  : "bg-gray-100 border-gray-200 text-gray-500"
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Last Name
            </label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`mt-1 w-full border rounded-lg px-3 py-2.5 text-sm ${
              editMode
                ? "bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Email
          </label>
          <input
            type="text"
            value={formData.email || ""}
            disabled
            className="mt-1 w-full border border-gray-200 px-3 py-2.5 rounded-lg bg-gray-100 text-sm text-gray-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Mobile
          </label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`mt-1 w-full border rounded-lg px-3 py-2.5 text-sm ${
              editMode
                ? "bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob ? formData.dob.split("T")[0] : ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`mt-1 w-full border rounded-lg px-3 py-2.5 text-sm ${
              editMode
                ? "bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          />
        </div>
      </div>

        {editMode && (
          <p className="mt-4 text-xs text-gray-400">
            You can update editable fields and save your changes.
          </p>
        )}
      </div>
    </div>
  );
}

