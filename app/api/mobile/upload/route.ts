import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const response = await utapi.uploadFiles(file);
    
    if (response.error) {
       console.error("UploadThing Error", response.error);
       return NextResponse.json({ error: "Falha no UploadThing" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: response.data?.url });
  } catch (error) {
    console.error("Erro no endpoint de upload:", error);
    return NextResponse.json({ error: "Falha interna ao processar upload" }, { status: 500 });
  }
}
