import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的收藏",
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
