import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  const username = name.replace(/\s+/g, "").toLowerCase();
  const base = "https://avatar.iran.liara.run/public";
  if (gender === "FEMALE") return `${base}/girl?username=${username}`;
  // default to boy
  return `${base}/boy?username=${username}`;
}

// phone formatting function for Indian +91 numbers
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;

  // Strip everything except digits and the leading +
  const raw = value.replace(/[^\d+]/g, "");

  // If the user typed +91..., preserve the prefix and format the 10-digit part
  let digits = raw.replace(/^\+91/, "").replace(/\D/g, "");

  // Limit to 10 digits (standard Indian mobile number)
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "+91 ";
  if (digits.length <= 5) return `+91 ${digits}`;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const getAvailableTimeSlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};

export const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Regular Checkup", duration: "60 min", price: "$120" },
  { id: "cleaning", name: "Teeth Cleaning", duration: "45 min", price: "$90" },
  {
    id: "consultation",
    name: "Consultation",
    duration: "30 min",
    price: "$75",
  },
  {
    id: "emergency",
    name: "Emergency Visit",
    duration: "30 min",
    price: "$150",
  },
];
