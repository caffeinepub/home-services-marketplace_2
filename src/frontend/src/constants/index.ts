export const SERVICE_CATEGORIES = [
  {
    id: "installation",
    emoji: "⚡",
    title: "Project Installation",
    color: "blue",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    iconBgClass: "bg-blue-100",
    description:
      "New wiring, panel installation, lighting setup, solar/energy system setup",
    services: [
      "New Wiring",
      "Panel Installation",
      "Lighting Setup",
      "Solar Installation",
    ],
  },
  {
    id: "maintenance",
    emoji: "🔧",
    title: "Preventive Maintenance",
    color: "green",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    iconBgClass: "bg-green-100",
    description: "Monthly inspection, quarterly maintenance, system testing",
    services: [
      "Monthly Inspection",
      "Quarterly Maintenance",
      "System Testing",
      "Equipment Servicing",
    ],
  },
  {
    id: "emergency",
    emoji: "🚨",
    title: "Emergency/Breakdown",
    color: "red",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    iconBgClass: "bg-red-100",
    description:
      "Power outage, short circuit, equipment failure, emergency repair",
    services: [
      "Power Outage",
      "Short Circuit Fix",
      "Equipment Failure",
      "Emergency Repair",
    ],
  },
  {
    id: "adhoc",
    emoji: "🔌",
    title: "On-Demand Services",
    color: "purple",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    iconBgClass: "bg-purple-100",
    description:
      "Switch repair, socket replacement, light fixing, minor wiring fixes",
    services: [
      "Switch Repair",
      "Socket Replacement",
      "Light Fixing",
      "Minor Wiring",
    ],
  },
];

export const LOCATIONS = [
  "Kalyan Nagar",
  "Banaswadi",
  "HRBR Layout",
  "Kasturi Nagar",
];

export const SERVICE_TYPES = [
  "Plumber",
  "Electrician",
  "Technician",
  "Energy Services",
];

export const WORK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const WORK_PREFERENCES = [
  "Project Work",
  "Daily Hour Work",
  "Maintenance Contracts",
];

export const MEMBERSHIP_ORDER: Record<string, number> = {
  gold: 0,
  silver: 1,
  bronze: 2,
};
