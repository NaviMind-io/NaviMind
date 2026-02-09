"use client";

export default function LoginBlock({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errors,
  setErrors,
  onContinue,
  onForgot,

  authError = "",
  onClearAuthError = () => {},
  isSubmitting = false,
  onGoogle = () => {},
}) {
  return (
    <div
  onSubmit={(e) => {
    e.preventDefault();
    onContinue(e);
  }}
  className="
    w-full max-w-xl rounded-xl p-0 bg-transparent 
     px-4 pt-4 pb-0 bg-transparent rounded-xl shadow-none"
>

      {/* 🔵 Overlay Loader */}
      {isSubmitting && (
  <div className="absolute inset-0 flex items-center justify-center z-50">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}

      {/* Email */}
      <div className="relative mb-6">
        <img
          src="/Mail.svg"
          alt="Email"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70 pointer-events-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onClearAuthError();
          }}
          placeholder="Email address"
          name="email"
          autoComplete="email"
          inputMode="email"
          className={`w-full p-3 pl-10 rounded bg-gray-800 text-white placeholder-gray-400 text-sm outline-none focus:ring-2 ${
            errors.email || authError
              ? "border border-red-500 focus:ring-red-500"
              : "focus:ring-blue-600"
          }`}
        />
      </div>
      {errors.email && (
        <p className="text-red-500 text-xs mb-2">Email is required</p>
      )}

      {/* Password */}
      <div className="relative mb-6">
        <img
          src="/Lock.svg"
          alt="Password"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70 pointer-events-none"
        />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            onClearAuthError();
          }}
          placeholder="Password"
          name="password"
          autoComplete="current-password"
          className={`w-full p-3 pr-10 pl-10 rounded bg-gray-800 text-white placeholder-gray-400 text-sm outline-none focus:ring-2 ${
            errors.password || authError
              ? "border border-red-500 focus:ring-red-500"
              : "focus:ring-blue-600"
          }`}
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <img
            src={showPassword ? "/Visibility_off.svg" : "/Visibility.svg"}
            alt="Toggle visibility"
            className="w-5 h-5 opacity-70 hover:opacity-100 transition"
          />
        </span>
      </div>
      {errors.password && (
        <p className="text-red-500 text-xs mb-2">Password is required</p>
      )}

      {/* Общая ошибка */}
      {authError && (
        <p className="text-red-500 text-xs mb-2">{authError}</p>
      )}

      {/* Login */}
      <button
        type="button"
        onClick={onContinue}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white py-2 rounded mb-3 text-sm font-medium shadow"
      >
        {isSubmitting ? "Please wait..." : "Continue"}
      </button>

      {/* Forgot */}
      <div className="flex justify-between text-sm text-blue-400 mb-4">
        <button
          type="button"
          onClick={onForgot}
          className="hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Microcopy */}
<div className="mt-14">
  <p className="hidden md:block text-sm text-white/70 text-center">
    NaviMind saves hours of manual search. Ask once, get it right.
  </p>
  <p className="md:hidden block text-[13px] text-white/60 text-center leading-relaxed">
    NaviMind saves hours of manual search.<br />
    Ask once, get it right.
  </p>
</div>
    </div>
  );
}
