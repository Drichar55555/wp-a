import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "编辑我的主页",
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
