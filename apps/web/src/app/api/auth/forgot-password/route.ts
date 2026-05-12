import { NextRequest, NextResponse } from "next/server";
import { readApiError } from "@/lib/api/error";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json())
  });

  if (!response.ok) return NextResponse.json({ message: await readApiError(response) }, { status: response.status });
  return NextResponse.json(await response.json());
}
