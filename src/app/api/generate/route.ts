import { NextResponse } from "next/server";
import { generateCarousel, generateImageFromPrompt } from "@/lib/ai";
import type { ContentFormat } from "@/types/carousel";

interface GenerateRequest {
  idea: string;
  format: ContentFormat;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.idea?.trim()) {
      return NextResponse.json({ error: "Idea is required." }, { status: 400 });
    }

    const format: ContentFormat = body.format ?? "carousel";
    const slides = await generateCarousel(body.idea.trim(), format);

    const slidesWithImages = await Promise.all(
      slides.map(async (slide) => ({
        ...slide,
        imageUrl: await generateImageFromPrompt(slide.imagePrompt),
      })),
    );

    return NextResponse.json({
      topic: body.idea.trim(),
      slides: slidesWithImages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    return NextResponse.json(
      {
        error: "Failed to generate carousel content.",
        details: message,
      },
      { status: 500 },
    );
  }
}
