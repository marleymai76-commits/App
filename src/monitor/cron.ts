
const BASE_URL = "http://localhost:3000";

async function trigger(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: "POST" });
    console.log(`OK → ${path}`, await res.text());
  } catch (err) {
    console.error(`ERRO → ${path}`, err);
  }
}

export async function runAllMonitors() {
  await trigger("/api/admin/test");
  await trigger("/api/admin/audit");
  await trigger("/api/admin/security-check");
  await trigger("/api/admin/performance-check");
  await trigger("/api/admin/uptime-check");
}

runAllMonitors();
