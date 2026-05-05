import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Latitude e Longitude válidas são obrigatórias" },
        { status: 400 }
      );
    }

    // Raio de 50km
    const radiusInKm = 50;

    // Fórmula de Haversine via Prisma $queryRaw
    // Usando 6371 como raio da terra em km
    const workshops = await prisma.$queryRaw`
      SELECT id, name, phone, latitude, longitude,
        (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(latitude))
          )
        ) AS distance
      FROM "Workshop"
      HAVING (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(latitude))
        )
      ) <= ${radiusInKm}
      ORDER BY distance ASC
      LIMIT 20;
    `;

    return NextResponse.json({ success: true, workshops });
  } catch (error) {
    console.error("Erro ao buscar oficinas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
