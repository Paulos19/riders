import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, points: user.points },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
      },
    });
  } catch (error) {
    console.error("Login Mobile Error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
