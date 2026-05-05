import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Buscamos todos os POIs, trazendo o usuário através da relação com a Rota
    const pois = await prisma.poi.findMany({
      include: {
        route: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapeamos para facilitar o consumo no mobile (colocando o user no nível do poi)
    const formattedPois = pois.map(poi => ({
      ...poi,
      user: poi.route.user,
    }));

    return NextResponse.json({ success: true, pois: formattedPois });
  } catch (error) {
    console.error("Erro ao listar POIs da comunidade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
