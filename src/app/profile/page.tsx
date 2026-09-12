"use client";

import { useState, useEffect, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SaveIcon,
  RotateCcwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { PatientGender } from "@prisma/client";
import {
  getMyProfile,
  updateMyProfile,
  UpdateProfileData,
} from "@/lib/actions/users";
import Navbar from "@/components/Navbar";

interface ProfileData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  clerkEmail: string;
  phone: string | null;
  age: number | null;
  gender: PatientGender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: Date;
}

function validateIndianPhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const is10 = digits.length === 10;
  const is12 = digits.length === 12 && digits.startsWith("91");
  if (!is10 && !is12) return "Enter a valid 10-digit Indian mobile number.";
  return null;
}

function validatePincode(pincode: string): string | null {
  if (!pincode) return null;
  if (!/^\d{6}$/.test(pincode.trim()))
    return "Pincode must be exactly 6 digits.";
  return null;
}

function validateAge(age: string): string | null {
  if (!age) return null;
  const n = Number(age);
  if (!Number.isInteger(n) || n < 1 || n > 120)
    return "Age must be between 1 and 120.";
  return null;
}

function displayPhone(stored: string | null): string {
  if (!stored) return "";
  const digits = stored.replace(/\D/g, "");
  const core = digits.startsWith("91") ? digits.slice(2) : digits;
  if (core.length !== 10) return stored;
  return `+91 ${core.slice(0, 5)} ${core.slice(5)}`;
}

const genderLabels: Record<PatientGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export default function ProfilePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<PatientGender | "">("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isLoaded && !isSignedIn) redirect("/portal-select");
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    setIsLoadingProfile(true);
    getMyProfile()
      .then((data) => {
        setProfile(data as ProfileData);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhone(displayPhone(data.phone));
        setAge(data.age !== null ? String(data.age) : "");
        setGender((data.gender as PatientGender | null) ?? "");
        setAddress(data.address ?? "");
        setCity(data.city ?? "");
        setState(data.state ?? "");
        setPincode(data.pincode ?? "");
      })
      .catch((err: unknown) =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load profile.",
        ),
      )
      .finally(() => setIsLoadingProfile(false));
  }, [isSignedIn]);

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "").replace(/^91/, "");
    digits = digits.slice(0, 10);
    if (digits.length === 0) {
      setPhone("");
    } else if (digits.length <= 5) {
      setPhone(`+91 ${digits}`);
    } else {
      setPhone(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
    }
    if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    const phoneErr = validateIndianPhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const ageErr = validateAge(age);
    if (ageErr) newErrors.age = ageErr;
    const pincodeErr = validatePincode(pincode);
    if (pincodeErr) newErrors.pincode = pincodeErr;
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(displayPhone(profile.phone));
    setAge(profile.age !== null ? String(profile.age) : "");
    setGender(profile.gender ?? "");
    setAddress(profile.address ?? "");
    setCity(profile.city ?? "");
    setState(profile.state ?? "");
    setPincode(profile.pincode ?? "");
    setFieldErrors({});
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setSaveSuccess(false);
    startTransition(async () => {
      try {
        const payload: UpdateProfileData = {
          firstName,
          lastName,
          phone,
          age: age ? Number(age) : null,
          gender: gender ? (gender as PatientGender) : null,
          address,
          city,
          state,
          pincode,
        };
        await updateMyProfile(payload);
        setSaveSuccess(true);
        toast.success("Profile updated successfully!");
        const updated = await getMyProfile();
        setProfile(updated as ProfileData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to save profile.";
        toast.error(message);
      }
    });
  };

  if (!isLoaded || isLoadingProfile) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24 space-y-6">
          <div className="h-8 w-40 bg-muted/40 animate-pulse rounded-xl" />
          <div className="h-48 bg-muted/20 animate-pulse rounded-2xl" />
          <div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircleIcon className="w-5 h-5 shrink-0" />
            {loadError}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 space-y-6 overflow-x-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Profile</h1>
            <p className="text-xs text-muted-foreground">
              Manage your personal information
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Account Information
            </h2>
            <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50 ml-1">
              Managed by Clerk
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                <MailIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {profile?.clerkEmail ?? "—"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Email is managed by your account provider.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Member Since
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">
            Personal Details
          </h2>

          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              Profile saved successfully!
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-firstName"
                className="text-xs font-medium text-foreground"
              >
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                id="profile-firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName)
                    setFieldErrors((er) => ({ ...er, firstName: "" }));
                }}
                placeholder="Rahul"
                className={`w-full px-3 py-2.5 rounded-xl bg-muted/20 border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${fieldErrors.firstName ? "border-destructive/60" : "border-border/50 focus:border-primary/50"}`}
              />
              {fieldErrors.firstName && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" />{" "}
                  {fieldErrors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="profile-lastName"
                className="text-xs font-medium text-foreground"
              >
                Last Name
              </label>
              <input
                id="profile-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-age"
                className="text-xs font-medium text-foreground"
              >
                Age
              </label>
              <input
                id="profile-age"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (fieldErrors.age)
                    setFieldErrors((er) => ({ ...er, age: "" }));
                }}
                placeholder="28"
                className={`w-full px-3 py-2.5 rounded-xl bg-muted/20 border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${fieldErrors.age ? "border-destructive/60" : "border-border/50 focus:border-primary/50"}`}
              />
              {fieldErrors.age && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" /> {fieldErrors.age}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="profile-gender"
                className="text-xs font-medium text-foreground"
              >
                Gender / Sex
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as PatientGender | "")
                }
                className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer"
              >
                <option value="">Select gender</option>
                {(Object.keys(genderLabels) as PatientGender[]).map((key) => (
                  <option key={key} value={key}>
                    {genderLabels[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-phone"
              className="text-xs font-medium text-foreground"
            >
              Phone Number
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/20 border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${fieldErrors.phone ? "border-destructive/60" : "border-border/50 focus:border-primary/50"}`}
              />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" /> {fieldErrors.phone}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Indian mobile number (+91 XXXXX XXXXX)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-address"
              className="text-xs font-medium text-foreground"
            >
              Address
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                id="profile-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 MG Road, Koramangala"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-city"
                className="text-xs font-medium text-foreground"
              >
                City
              </label>
              <input
                id="profile-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="profile-state"
                className="text-xs font-medium text-foreground"
              >
                State
              </label>
              <input
                id="profile-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label
                htmlFor="profile-pincode"
                className="text-xs font-medium text-foreground"
              >
                Pincode
              </label>
              <input
                id="profile-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (fieldErrors.pincode)
                    setFieldErrors((er) => ({ ...er, pincode: "" }));
                }}
                placeholder="560001"
                className={`w-full px-3 py-2.5 rounded-xl bg-muted/20 border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${fieldErrors.pincode ? "border-destructive/60" : "border-border/50 focus:border-primary/50"}`}
              />
              {fieldErrors.pincode && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" /> {fieldErrors.pincode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/40 border border-transparent hover:border-border/40 disabled:opacity-50"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
