import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Get challenge error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch challenge",
      },
      { status: 500 }
    );
  }
}
