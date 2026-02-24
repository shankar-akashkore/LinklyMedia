import React, { useEffect, useState } from "react";
import { PencilSimpleIcon, CheckIcon, XIcon, LockSimpleIcon } from "@phosphor-icons/react";

const Field = ({ label, value, field, type = "text", editing, onChange, readOnly = false }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1">
      {label}
      {readOnly && <LockSimpleIcon size={11} className="text-gray-400" />}
    </label>
    {editing ? (
      readOnly ? (
        // Non-editable fields — shown as greyed out even in edit mode
        <p className="text-sm text-gray-400 py-2 px-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
          {value || <span className="italic">Not set</span>}
        </p>
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-[#507c88]/40 focus:border-[#507c88]"
        />
      )
    ) : (
      <p className="text-sm font-semibold text-gray-400 py-2 border-b border-gray-100">
        {value || <span className="text-gray-400 font-normal">Not set</span>}
      </p>
    )}
  </div>
);

const getField = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const setFieldDeep = (obj, path, value) => {
  const keys = path.split(".");
  const copy = { ...obj };
  let ref = copy;
  for (let i = 0; i < keys.length - 1; i++) {
    ref[keys[i]] = { ...ref[keys[i]] };
    ref = ref[keys[i]];
  }
  ref[keys[keys.length - 1]] = value;
  return copy;
};

const FIELDS = [
  { label: "First Name",    field: "firstname"                               },
  { label: "Last Name",     field: "lastname"                                },
  { label: "Email",         field: "email",             type: "email",  readOnly: true },
  { label: "Mobile",        field: "mobile",            type: "tel",    readOnly: true },
  { label: "Business Name", field: "partner.businessname"                    },
  { label: "Business Type", field: "partner.businesstype"                    },
  { label: "Contact Email", field: "partner.contactemail", type: "email"    },
  { label: "Contact Phone", field: "partner.contactphone", type: "tel"      },
  { label: "GST Number",    field: "partner.gstnumber",   readOnly: true     }, // 🔒 locked
  { label: "PAN Number",    field: "partner.pannumber",   readOnly: true     }, // 🔒 locked
  { label: "City",          field: "partner.address.city"                    },
  { label: "State",         field: "partner.address.state"                   },
  { label: "Pincode",       field: "partner.address.pincode"                 },
  { label: "Street",        field: "partner.address.street"                  },
];

export default function PartnerProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/partner/profile", { headers })
      .then((r) => { if (!r.ok) throw new Error("Failed to load profile"); return r.json(); })
      .then((d) => { const user = d.user ?? d; setProfile(user); setForm(user); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (path, value) => {
    setForm((prev) => setFieldDeep(prev, path, value));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Strip read-only fields before sending — never send mobile/email/gst/pan
      const readOnlyFields = FIELDS.filter((f) => f.readOnly).map((f) => f.field);
      const payload = { ...form };
      readOnlyFields.forEach((path) => {
        const keys = path.split(".");
        let ref = payload;
        for (let i = 0; i < keys.length - 1; i++) {
          if (ref[keys[i]]) ref[keys[i]] = { ...ref[keys[i]] };
          ref = ref?.[keys[i]];
        }
        if (ref) delete ref[keys[keys.length - 1]];
      });
      // Also remove top-level read-only
      delete payload.mobile;
      delete payload.email;

      const r = await fetch("/api/partner/profile", {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed to save profile");
      let updated = form;
      try {
        const d = await r.json();
        if (d.user || d.firstname) updated = d.user ?? d;
      } catch (_) {}
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Profile</h2>
          <p className="text-sm text-gray-400">Manage your partner account details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-[#507c88] rounded-lg text-sm text-white hover:bg-[#507c88]/80 transition">
            <PencilSimpleIcon size={15} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(profile); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
              <XIcon size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#507c88] text-white rounded-lg text-sm hover:bg-[#3d6370] transition disabled:opacity-60">
              <CheckIcon size={14} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {error   && <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      {success && <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3">Profile updated successfully.</div>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {FIELDS.map(({ label, field, type, readOnly }) => (
            <Field
              key={field}
              label={label}
              field={field}
              type={type}
              readOnly={readOnly}
              editing={editing}
              value={getField(editing ? form : profile, field)}
              onChange={handleChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}