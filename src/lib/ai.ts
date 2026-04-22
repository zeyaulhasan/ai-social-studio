import type { ContentFormat, Slide } from "@/types/carousel";

const DEFAULT_TEXT_MODEL = process.env.OPENROUTER_TEXT_MODEL ?? "mistralai/mistral-7b-instruct";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function formatHint(format: ContentFormat) {
  switch (format) {
    case "story":
      return "Instagram Story (9:16).";
    case "post":
      return "Instagram Post (1:1).";
    default:
      return "Instagram Carousel (multi-slide sequence).";
  }
}

function toPrompt(idea: string, format: ContentFormat) {
  const slideCount = format === "post" ? 1 : 5;
  const slideInstruction = format === "post" 
    ? "Generate ONLY ONE high-impact slide." 
    : "Generate exactly 5 slides (Slide 1: Hook, Slides 2-4: Core, Slide 5: Takeaway).";

  return [
    "You are a viral social media expert.",
    "Create a HIGHLY engaging Instagram content.",
    "",
    "Rules:",
    "* Each slide must be maximum 2 lines",
    "* Use simple, emotional, relatable language",
    "* Add curiosity, hooks, and storytelling",
    "* Use emojis where appropriate",
    "* Make it feel human, not robotic",
    "* Audience: parents and students",
    "",
    slideInstruction,
    "",
    "Output format STRICTLY:",
    format === "post" ? "Slide 1: [Viral Hook + Explanation]" : "Slide 1: [Hook], Slide 2-4: [Core], Slide 5: [Takeaway]",
    "",
    `Return ONLY a valid JSON object with the following structure:
{
  "slides": [
    {
      "title": "Short catchy title",
      "text": "Brief supporting text (max 200 chars)",
      "imagePrompt": "Description for an AI icon/visual"
    }
  ]
}
Generate exactly ${slideCount} slide(s).`,
    "",
    `Idea: ${idea}`,
    `Optimize for: ${formatHint(format)}`
  ].join("\n");
}

function normalizeSlides(rawSlides: Array<{ title: string; text: string; imagePrompt: string }>, format: ContentFormat): Slide[] {
  const limit = format === "post" ? 1 : 5;
  return rawSlides.slice(0, limit).map((slide) => ({
    id: crypto.randomUUID(),
    title: slide.title.trim(),
    text: slide.text.trim(),
    imagePrompt: slide.imagePrompt.trim(),
    imageUrl: undefined,
  }));
}

export async function generateCarousel(idea: string, format: ContentFormat) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a social media content strategist. You always output valid JSON.",
        },
        {
          role: "user",
          content: toPrompt(idea, format),
        },
      ],
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("OpenRouter Error Details:", JSON.stringify(data, null, 2));
    throw new Error(data.error?.message || `OpenRouter API failed with status ${response.status}`);
  }

  const content = data.choices[0].message.content;
  
  // Clean potential markdown formatting
  const cleanContent = content.replace(/```json\n?|```/g, "").trim();
  
  const parsed = JSON.parse(cleanContent) as {
    slides: Array<{ title: string; text: string; imagePrompt: string }>;
  };

  return normalizeSlides(parsed.slides, format);
}

export async function regenerateSlide(
  idea: string,
  format: ContentFormat,
  slideIndex: number,
  currentSlide?: Pick<Slide, "title" | "text" | "imagePrompt">,
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const prompt = [
    `Regenerate only slide ${slideIndex + 1} for a 5-slide educational Instagram sequence.`,
    "Keep it concise, parent-friendly, and high-impact.",
    `Format target: ${formatHint(format)}`,
    "",
    `Original idea: ${idea}`,
    currentSlide
      ? `Current draft context: Title "${currentSlide.title}", Text "${currentSlide.text}", Visual "${currentSlide.imagePrompt}"`
      : "No previous draft context provided.",
    "",
    "Return ONLY a valid JSON object with keys: title, text, imagePrompt.",
  ].join("\n");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: "You improve social media slides. You always output valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenRouter Error Details:", JSON.stringify(data, null, 2));
    throw new Error(data.error?.message || `OpenRouter API failed with status ${response.status}`);
  }

  const content = data.choices[0].message.content;
  
  // Clean potential markdown formatting
  const cleanContent = content.replace(/```json\n?|```/g, "").trim();

  const parsed = JSON.parse(cleanContent) as {
    title: string;
    text: string;
    imagePrompt: string;
  };

  return {
    id: crypto.randomUUID(),
    title: parsed.title.trim(),
    text: parsed.text.trim(),
    imagePrompt: parsed.imagePrompt.trim(),
  } as Slide;
}

export async function generateImageFromPrompt(imagePrompt: string) {
  // Image generation is not available via standard OpenRouter chat completions.
  console.log("Image generation skipped for prompt:", imagePrompt);
  return undefined;
}
