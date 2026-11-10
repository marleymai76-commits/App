export const ADMIN_MASTER_EMAILS = [
  "josephmarleypt@gmail.com",
  "jmrcps4@gmail.com",
  "marleymai@hotmail.com",
  "marleymai76@gmail.com"
];

export function isAdminMaster(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_MASTER_EMAILS.includes(email.trim().toLowerCase());
}

export function getUserPlan(email: string | null): string {
  if (!email) return "NORMAL_PLAN";
  const normalized = email.trim().toLowerCase();
  if (ADMIN_MASTER_EMAILS.includes(normalized)) {
    return "MAXIMUM_MASTER_PLAN";
  }
  return "NORMAL_PLAN";
}

export interface StaffMember {
  email: string;
  role: string;
  name: string;
  permissions: string;
}

export const MASTER_STAFF_DETAILS: Record<string, StaffMember> = {
  "josephmarleypt@gmail.com": {
    email: "josephmarleypt@gmail.com",
    role: "superadmin",
    name: "Marley",
    permissions: "full"
  },
  "jmrcps4@gmail.com": {
    email: "jmrcps4@gmail.com",
    role: "superadmin",
    name: "Marley (JMR)",
    permissions: "full"
  },
  "marleymai@hotmail.com": {
    email: "marleymai@hotmail.com",
    role: "superadmin",
    name: "Marley (Hotmail)",
    permissions: "full"
  },
  "marleymai76@gmail.com": {
    email: "marleymai76@gmail.com",
    role: "superadmin",
    name: "Marley (Dev)",
    permissions: "full"
  }
};
