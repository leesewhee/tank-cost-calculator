export const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const COMPANY = "월드테크(주)";
const COMPANY_INFO =
  "경기도 화성시 마도면 백곡리 344-10 | ☎ (031)355-2581 | FAX (031)355-2357";

export const todayString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
};

export const openPrintWindow = (title: string, subtitle: string, bodyHtml: string) => {
  const win = window.open("", "_blank", "width=1000,height=800");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Malgun Gothic','맑은 고딕',sans-serif; color:#111; margin:0; }
  .doc-header { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; }
  .doc-header h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: 2px; text-align:center; }
  .meta { display:flex; justify-content:space-between; font-size: 11px; color:#333; }
  h2.group { font-size: 13px; margin: 16px 0 6px; padding: 4px 8px; background:#f1f1f1; border-left: 4px solid #333; page-break-after: avoid; }
  table { width:100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #999; padding: 5px 6px; text-align: left; vertical-align: top; }
  th { background:#eee; font-weight:600; }
  .label { background:#f6f6f6; font-weight:600; width: 110px; white-space: nowrap; }
  .section { page-break-inside: avoid; margin-bottom: 18px; }
  .page-break { page-break-before: always; }
  .sign { margin-top: 10px; width: 60%; margin-left:auto; }
  .footer { margin-top: 18px; border-top:1px solid #999; padding-top:6px; font-size:10px; color:#555; text-align:center; }
  .muted { color:#666; }
</style></head><body>
<div class="doc-header">
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">
    <span>${escapeHtml(COMPANY)}</span>
    <span>${escapeHtml(subtitle)}</span>
    <span>출력일: ${todayString()}</span>
  </div>
</div>
${bodyHtml}
<div class="footer">${escapeHtml(COMPANY)} | ${escapeHtml(COMPANY_INFO)}</div>
</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};

/** 날짜 문자열(2026.01.20 / 2026-01-20)을 정렬 가능한 키로 */
export const dateKey = (v: string) => (v || "").replace(/[^0-9]/g, "");

export function groupByDate<T>(items: T[], getDate: (t: T) => string) {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const d = getDate(item) || "날짜 미지정";
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(item);
  });
  return Array.from(map.entries()).sort((a, b) => dateKey(b[0]).localeCompare(dateKey(a[0])));
}
