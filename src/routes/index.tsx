import { createFileRoute } from "@tanstack/react-router";

// The actual project is plain HTML/CSS/JS in public/codefusion/.
// This page just shows it full-screen in the preview.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Code Fusion — Search and Rescue Coordination" },
      { name: "description", content: "Coordinate search-and-rescue incidents, zones, teams, findings and resources." },
      { property: "og:title", content: "Code Fusion — Search and Rescue Coordination" },
      { property: "og:description", content: "Coordinate search-and-rescue incidents, zones, teams, findings and resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/codefusion/index.html"
      title="Code Fusion SAR System"
      className="fixed inset-0 h-screen w-screen border-0"
    />
  );
}
