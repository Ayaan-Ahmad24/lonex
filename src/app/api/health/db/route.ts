
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { status: "not_found" },
      { status: 404 }
    );
  }

  try {
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      orm: "drizzle",
    });
  } catch (error) {
    console.error("[Database Health Check] Connection failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
