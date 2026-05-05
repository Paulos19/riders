import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, name: true },
    });

    return NextResponse.json({ success: true, gamification: user });
  } catch (error) {
    console.error("Erro ao buscar pontos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { pointsToAdd } = body;

    if (typeof pointsToAdd !== "number" || pointsToAdd <= 0) {
      return NextResponse.json({ error: "pointsToAdd deve ser um número positivo" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsToAdd,
        },
      },
      select: { points: true },
    });

    return NextResponse.json({ success: true, points: updatedUser.points });
  } catch (error) {
    console.error("Erro ao adicionar pontos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
