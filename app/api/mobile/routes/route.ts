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

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { title, description, coverImage, distanceKm, pois, path, difficulty } = body;

    // Check if it's the user's first route
    const routeCount = await prisma.route.count({ where: { userId } });
    const pointsToAward = routeCount === 0 ? 100 : 30;

    const route = await prisma.route.create({
      data: {
        userId,
        title,
        description,
        coverImage,
        distanceKm,
        difficulty: difficulty || "Médio",
        path: path || [],
        pois: {
          create: pois?.map((poi: any) => ({
            latitude: poi.latitude,
            longitude: poi.longitude,
            imageUrl: poi.imageUrl,
            description: poi.description,
            type: poi.type,
          })) || [],
        },
      },
      include: {
        pois: true,
      },
    });

    // Award points to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsToAward,
        },
      },
    });

    return NextResponse.json({ success: true, route, pointsAwarded: pointsToAward }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar rota:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const routes = await prisma.route.findMany({
      where: { userId },
      include: { pois: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, routes });
  } catch (error) {
    console.error("Erro ao listar rotas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
