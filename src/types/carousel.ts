export type ContentFormat = "post" | "story" | "carousel";

export interface Slide {
  id: string;
  title: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface CarouselResult {
  topic: string;
  slides: Slide[];
}
