import { redirect } from "next/navigation";
import { DEFAULT_KIT_ID } from "@/lib/kits";

export default function Home() {
  redirect(`/ar/${DEFAULT_KIT_ID}`);
}
