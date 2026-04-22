import { NextResponse } from "next/server";
import { generateImageFromPrompt, regenerateSlide } from "@/lib/ai";
import type { ContentFormat, Slide } from "@/types/carousel";

interface RegenerateSlideRequest {
  idea: string;
  format: ContentFormat;
  slideIndex: number;
  currentSlide?: Pick<Slide, "title" | "text" | "imagePrompt">;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegenerateSlideRequest;

    if (!body.idea?.trim()) {
      return NextResponse.json({ error: "Idea is required." }, { status: 400 });
    }

    if (body.slideIndex < 0 || body.slideIndex > 4) {
      return NextResponse.json({ error: "slideIndex must be between 0 and 4." }, { status: 400 });
    }

    const slide = await regenerateSlide(
      body.idea.trim(),
      body.format ?? "carousel",
      body.slideIndex,
      body.currentSlide,
    );

    const imageUrl = await generateImageFromPrompt(slide.imagePrompt);

    return NextResponse.json({
      ...slide,
      imageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    return NextResponse.json(
      {
        error: "Failed to regenerate slide.",
        details: message,
      },
      { status: 500 },
    );
  }
}
