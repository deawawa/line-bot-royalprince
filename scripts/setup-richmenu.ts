/**
 * Creates the LINE Rich Menu (MASTER PROMPT §32).
 * Run: npm run richmenu:setup
 * Requires LINE_CHANNEL_ACCESS_TOKEN in env.
 * Note: you must also upload a 2500x1686 menu image via the LINE API or
 * OA Manager afterwards — see docs/DEPLOYMENT.md.
 */
const BOOKING_URL = "https://book-directonline.com/properties/royalprincepattaya";

async function main() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  const richMenu = {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: "RPRP Main Menu",
    chatBarText: "เมนู",
    areas: [
      { bounds: { x: 0, y: 0, width: 833, height: 843 }, action: { type: "message", text: "ดูห้องพัก" } },
      { bounds: { x: 833, y: 0, width: 834, height: 843 }, action: { type: "message", text: "โปรโมชั่น" } },
      { bounds: { x: 1667, y: 0, width: 833, height: 843 }, action: { type: "uri", uri: `${BOOKING_URL}?utm_source=line&utm_medium=chatbot&utm_campaign=direct_booking&utm_content=rich_menu` } },
      { bounds: { x: 0, y: 843, width: 833, height: 843 }, action: { type: "message", text: "พัก 24 ชั่วโมง" } },
      { bounds: { x: 833, y: 843, width: 834, height: 843 }, action: { type: "message", text: "สิ่งอำนวยความสะดวก" } },
      { bounds: { x: 1667, y: 843, width: 833, height: 843 }, action: { type: "message", text: "ติดต่อโรงแรม" } },
    ],
  };

  const res = await fetch("https://api.line.me/v2/bot/richmenu", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(richMenu),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error("Failed to create rich menu:", body);
    process.exit(1);
  }
  console.log("Rich menu created:", body.richMenuId);
  console.log("Next: upload an image then set as default:");
  console.log(`  POST https://api-data.line.me/v2/bot/richmenu/${body.richMenuId}/content`);
  console.log(`  POST https://api.line.me/v2/bot/user/all/richmenu/${body.richMenuId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
