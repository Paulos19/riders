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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const resolvedParams = await params;
    const routeId = resolvedParams.id;
    const body = await req.json();
    const { rating } = body; // 1 to 5

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação inválida" }, { status: 400 });
    }

    const route = await prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 });
    }

    // Calculate new average rating
    const newRatingCount = route.ratingCount + 1;
    const newRating = (route.rating * route.ratingCount + rating) / newRatingCount;

    await prisma.route.update({
      where: { id: routeId },
      data: {
        rating: newRating,
        ratingCount: newRatingCount,
      },
    });

    // Award points to the rater
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: 10,
        },
      },
    });

    return NextResponse.json({ success: true, newRating, newRatingCount, pointsAwarded: 10 });
  } catch (error) {
    console.error("Erro ao avaliar rota:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
