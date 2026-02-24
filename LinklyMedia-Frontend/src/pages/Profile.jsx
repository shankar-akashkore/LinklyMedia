import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
          console.error("Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
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
        alert("Profile updated successfully");
        setUser(data);
        setEditMode(false);
      } else {
        alert(data?.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error");
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-20 bg-white shadow-xl p-8 rounded-xl">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          <input
            type="text"
            name="firstname"
            value={user.firstname || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full border p-2 rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full border p-2 rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            type="text"
            value={formData.email || ""}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile || ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full border p-2 rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob ? formData.dob.split("T")[0] : ""}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full border p-2 rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-[#507c88] text-white px-6 py-2 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="border px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-[#507c88] text-white px-6 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
