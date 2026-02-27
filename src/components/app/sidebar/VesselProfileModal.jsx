import { useEffect, useRef, useState } from "react";
import CustomSelect from "./CustomSelect";

export default function VesselProfileModal({ open, onClose, onSave }) {
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    rank: "",
    vesselType: "",
    capacity: "",
    flag: "",
    engineType: "",
    tradingArea: "",
    classification: "",
    specialNotes: "",
  });
  const [customRank, setCustomRank] = useState("");
  const [customClassification, setCustomClassification] = useState("");

  const finalClassification =
  form.classification === "Other"
    ? customClassification.trim()
    : form.classification;

  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [open]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalRank =
  form.rank === "Other" ? customRank.trim() : form.rank;

if (!finalRank || !form.vesselType || !form.capacity) return;

onSave({
  ...form,
  rank: finalRank,
  classification: finalClassification,
});
  };

  if (!open) return null;

  const rankOptions = [
  "Master",
  "Chief Officer",
  "2nd Officer",
  "3rd Officer",
  "Junior Officer",
  "Chief Engineer",
  "2nd Engineer",
  "3rd Engineer",
  "4th Engineer",
  "Electrical Engineer",
  "Gas Engineer",
  "Superintendent",
  "Other",
];

const vesselTypeOptions = [
  "LNG",
  "LPG",
  "Tanker",
  "Bulk Carrier",
  "Container",
  "Ro-Ro",
  "Passenger",
  "Offshore",
  "General Cargo",
  "Other",
];

const classificationOptions = [
  "DNV",
  "ABS",
  "LR",
  "BV",
  "RINA",
  "ClassNK",
  "CCS",
  "KR",
  "IRS",
  "Other",
];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 sm:bg-black/60 p-4 sm:p-3"
      onClick={handleBackdropClick}
    >
      <form
        onSubmit={handleSubmit}
        className="
bg-white/90 dark:bg-gray-800/90
w-full
sm:max-w-md
max-h-[95vh]
rounded-3xl sm:rounded-2xl
border border-white/10
backdrop-blur-md
p-4 sm:p-6
shadow-2xl
flex flex-col
gap-3
"
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      >
        <div className="flex items-center justify-between mb-2">
  <div className="w-6" /> {/* spacer */}
  
  <h2 className="text-lg font-bold text-center flex-1">
    Vessel Profile
  </h2>

  <button
    type="button"
    onClick={onClose}
    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition"
  >
    ✕
  </button>
</div>

{/* Rank */}
{form.rank !== "Other" ? (
  <CustomSelect
    value={form.rank}
    onChange={(val) => handleChange("rank", val)}
    options={rankOptions}
    placeholder="Select Rank *"
  />
) : (
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Enter your position *"
      value={customRank}
      onChange={(e) => setCustomRank(e.target.value)}
      className="input-style flex-1"
    />
    <button
      type="button"
      onClick={() => {
        handleChange("rank", "");
        setCustomRank("");
      }}
      className="px-3 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 text-sm transition"
    >
      Back
    </button>
  </div>
)}

        {/* Vessel Type */}
<CustomSelect
  value={form.vesselType}
  onChange={(val) => handleChange("vesselType", val)}
  options={vesselTypeOptions}
  placeholder="Select Vessel Type *"
/>

        {/* Capacity */}
        <input
          type="text"
          placeholder="DWT / Capacity"
          value={form.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
          className="input-style"
        />

        {/* Flag */}
        <input
          type="text"
          placeholder="Flag"
          value={form.flag}
          onChange={(e) => handleChange("flag", e.target.value)}
          className="input-style"
        />

        {/* Engine */}
        <input
          type="text"
          placeholder="Engine Type"
          value={form.engineType}
          onChange={(e) => handleChange("engineType", e.target.value)}
          className="input-style"
        />

        {/* Trading Area */}
        <input
          type="text"
          placeholder="Trading Area"
          value={form.tradingArea}
          onChange={(e) => handleChange("tradingArea", e.target.value)}
          className="input-style"
        />

        {/* Classification */}
{form.classification !== "Other" ? (
  <CustomSelect
    value={form.classification}
    onChange={(val) => handleChange("classification", val)}
    options={classificationOptions}
    placeholder="Classification Society"
  />
) : (
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Enter classification society"
      value={customClassification}
      onChange={(e) => setCustomClassification(e.target.value)}
      className="input-style flex-1"
    />
    <button
      type="button"
      onClick={() => {
        handleChange("classification", "");
        setCustomClassification("");
      }}
      className="px-3 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700 text-sm transition"
    >
      Back
    </button>
  </div>
)}

        {/* Notes */}
        <textarea
  placeholder="Add operational specifics: ice class, dual-fuel engine, DP2 system, etc."
  value={form.specialNotes}
  maxLength={300}
  onChange={(e) => handleChange("specialNotes", e.target.value)}
  className="input-style resize-none custom-scroll"
  rows={3}
/>

<div className="text-xs text-right text-gray-400">
  {form.specialNotes.length}/300
</div>

        <button
          type="submit"
          disabled={!form.rank || !form.vesselType || !form.capacity}
          className={`
            mt-2 px-4 py-2 rounded-xl font-medium transition
            ${form.rank && form.vesselType && form.capacity
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}
          `}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}