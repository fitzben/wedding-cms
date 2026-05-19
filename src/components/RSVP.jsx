import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { getWishes, invalidateWishes } from "../services/wishService";
import LogoLoader from "./LogoLoader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RSVP = ({ guest, guestName, maxPax = 2, eventAccess = "both" }) => {
  useScrollReveal();

  const [formData, setFormData] = useState({
    name: guestName || "Guest Name",
    pax: 1,
    attendance: "yes",
    event_attendance: eventAccess === "both" ? "" : eventAccess,
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [wishes, setWishes] = useState([]);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [paxOpen, setPaxOpen] = useState(false);
  const paxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (paxRef.current && !paxRef.current.contains(e.target)) {
        setPaxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with guest data including existing RSVP
  useEffect(() => {
    if (guest) {
      setFormData((prev) => ({
        ...prev,
        name: guest.display_name || prev.name,
        pax: guest.rsvp_pax || prev.pax,
        attendance: guest.rsvp_attendance || prev.attendance,
        event_attendance:
          guest.rsvp_event_attendance ||
          (eventAccess !== "both" ? eventAccess : prev.event_attendance),
        message: guest.rsvp_message || prev.message,
      }));
    }
  }, [guest, eventAccess]);

  const fetchWishes = async () => {
    try {
      const data = await getWishes();
      setWishes(data || []);
    } catch (err) {
      console.error("Error loading wishes:", err);
    } finally {
      setWishesLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Prepare the RSVP request
      const rsvpPromise = fetch(`${API_BASE_URL}/api/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pax: parseInt(formData.pax, 10) || 1,
          guest_id: guest?.id,
          event_attendance:
            formData.attendance === "no"
              ? null
              : formData.event_attendance || null,
        }),
      });

      // Prepare the Wishes request if message is not empty
      let wishesPromise = Promise.resolve({ ok: true });
      if (formData.message.trim()) {
        wishesPromise = fetch(`${API_BASE_URL}/api/wishes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            message: formData.message,
          }),
        });
      }

      // Execute both requests concurrently
      const [rsvpResponse, wishesResponse] = await Promise.all([
        rsvpPromise,
        wishesPromise,
      ]);

      if (!rsvpResponse.ok) {
        const data = await rsvpResponse.json();
        if (
          rsvpResponse.status === 403 &&
          (data.error?.includes("deadline") || data.error?.includes("closed"))
        ) {
          setErrorMessage("Maaf, batas waktu RSVP sudah berakhir.");
          setStatus("error");
          return;
        }
        throw new Error(data.error || "Failed to submit RSVP");
      }

      if (!wishesResponse.ok) {
        const data = await wishesResponse.json();
        throw new Error(data.error || "Failed to submit your message");
      }

      setStatus("success");
      // Clear message but keep name/pax/attendance for "Send Another" or consistency
      setFormData((prev) => ({ ...prev, message: "" }));
      // Invalidate cache then refetch so new wish appears immediately
      invalidateWishes();
      fetchWishes();
    } catch (error) {
      console.error("Submission Error:", error);
      setErrorMessage(
        error.message || "An unexpected error occurred. Please try again.",
      );
      setStatus("error");
    }
  };

  const isUpdate = !!guest?.rsvp_id;

  return (
    <section
      id="section-rsvp"
      className="py-24 bg-offwhite text-charcoal flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-16"
    >
      <div
        className="max-w-[440px] w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-12 relative overflow-hidden obs-hide obs-up"
        style={{ animationDelay: "100ms" }}
      >
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/40 via-maroon to-gold/40"></div>

        <div className="text-center mb-10">
          <svg
            className="w-8 h-8 text-gold mx-auto mb-4 opacity-80"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="50" cy="50" r="45"></circle>
            <circle cx="50" cy="50" r="35"></circle>
            <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M18 82 L25 75 M75 25 L82 18"></path>
          </svg>
          <h2 className="font-serif text-3xl md:text-4xl text-maroon mb-2 italic">
            RSVP & Wishes
          </h2>
          <p className="text-gray-400 font-light text-sm tracking-wide">
            {isUpdate
              ? "You have already responded. Feel free to update below."
              : "We would love to hear from you"}
          </p>
        </div>

        {status === "success" ? (
          <div className="py-6 text-center animate-fade-in relative z-10">
            <div className="w-20 h-20 rounded-full bg-maroon/5 text-maroon mx-auto flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-serif text-maroon mb-3 italic">
              {isUpdate ? "Response Updated!" : "Thank you!"}
            </h3>
            <p className="text-gray-500 font-light text-sm leading-relaxed mb-8">
              {isUpdate
                ? "Your RSVP has been successfully updated."
                : "Your response and message have been wonderfully received."}
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-500 text-xs font-semibold tracking-widest uppercase hover:bg-gray-50 hover:text-maroon transition-all rounded-full cursor-pointer"
            >
              {isUpdate ? "Edit Again" : "Send Another"}
            </button>
          </div>
        ) : (
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-light text-center animate-fade-in">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="How should we address you?"
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-light text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/30 focus:bg-white transition-all"
                disabled={status === "loading"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
                Number of Guests
              </label>

              {/* Mobile: custom dropdown */}
              <div ref={paxRef} className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setPaxOpen((v) => !v)}
                  disabled={status === "loading"}
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-light text-gray-700 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/30 focus:bg-white transition-all"
                >
                  <span>
                    {formData.pax} {formData.pax === 1 ? "person" : "people"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${paxOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {paxOpen && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                    {Array.from({ length: maxPax }, (_, i) => i + 1).map(
                      (n) => (
                        <li
                          key={n}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, pax: n }));
                            setPaxOpen(false);
                          }}
                          className={`px-5 py-3 text-sm cursor-pointer transition-colors ${formData.pax === n ? "bg-maroon/10 text-maroon font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {n} {n === 1 ? "person" : "people"}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>

              {/* Desktop: number input */}
              <input
                type="number"
                name="pax"
                min="1"
                max={maxPax}
                value={formData.pax}
                onChange={handleChange}
                required
                placeholder="Including yourself"
                disabled={status === "loading"}
                className="hidden md:block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-light text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/30 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1 text-center">
                Will you attend?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "yes", label: "Yes" },
                  // { value: "maybe", label: "Maybe" },
                  { value: "no", label: "No" },
                ].map(({ value, label }) => (
                  <label key={value} className="relative cursor-pointer group">
                    <input
                      type="radio"
                      name="attendance"
                      value={value}
                      checked={formData.attendance === value}
                      onChange={handleChange}
                      className="peer sr-only"
                      disabled={status === "loading"}
                    />
                    <div className="text-center py-3 border border-gray-100 bg-gray-50/50 rounded-xl text-xs font-medium text-gray-500 peer-checked:bg-maroon peer-checked:border-maroon peer-checked:text-gold peer-checked:shadow-md transition-all duration-300 hover:border-maroon/30 group-hover:bg-gray-50">
                      {label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {eventAccess === "both" && formData.attendance !== "no" && (
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1 text-center">
                  Which event will you attend?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "hm_only", label: "Holy Matrimony", icon: "⛪" },
                    { value: "both", label: "Both Events", icon: "🎊" },
                    { value: "resepsi_only", label: "Reception", icon: "🥂" },
                  ].map(({ value, label, icon }) => (
                    <label
                      key={value}
                      className="relative cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="event_attendance"
                        value={value}
                        checked={formData.event_attendance === value}
                        onChange={handleChange}
                        className="peer sr-only"
                        disabled={status === "loading"}
                      />
                      <div className="text-center py-3 px-1 border border-gray-100 bg-gray-50/50 rounded-xl text-[11px] font-medium text-gray-500 peer-checked:bg-maroon peer-checked:border-maroon peer-checked:text-gold peer-checked:shadow-md transition-all duration-300 hover:border-maroon/30 group-hover:bg-gray-50 leading-tight">
                        <div className="text-base mb-1">{icon}</div>
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                placeholder="Leave a wish for the couple..."
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-light text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/30 focus:bg-white transition-all resize-none"
                disabled={status === "loading"}
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full py-4 bg-maroon text-gold text-xs font-semibold uppercase tracking-widest rounded-2xl transition-all duration-500 ${
                  status === "loading"
                    ? "opacity-70 cursor-not-allowed transform scale-95"
                    : "hover:bg-maroon/90 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                }`}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-gold"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isUpdate ? "Updating..." : "Sending..."}
                  </span>
                ) : isUpdate ? (
                  "Update Reply"
                ) : (
                  "Send Reply"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Wishes Feed */}
      <div
        className="max-w-[600px] w-full obs-hide obs-up"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="font-serif text-2xl text-maroon mb-8 italic text-center">
          Wedding Wishes
        </h3>

        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 p-6 max-h-[500px] overflow-y-auto space-y-4 custom-scrollbar">
          {wishesLoading ? (
            <div className="py-10 flex items-center justify-center">
              <LogoLoader
                text="Loading wishes..."
                size={56}
                textClassName="text-gray-400 font-light italic text-sm"
              />
            </div>
          ) : wishes.length > 0 ? (
            wishes.map((wish, idx) => (
              <div
                key={wish.id || idx}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-serif text-maroon italic text-lg">
                    {wish.name}
                  </h4>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest">
                    {wish.created_at
                      ? new Date(wish.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <p className="text-gray-500 font-light text-sm leading-relaxed whitespace-pre-line lowercase italic">
                  "{wish.message}"
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 font-light italic">
              No wishes yet. Be the first to send one!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RSVP;
