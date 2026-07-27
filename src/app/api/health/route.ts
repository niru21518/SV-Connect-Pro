export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({
      status: "ok",
      app: "SV Connect Pro",
      database: "firestore"
    });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
