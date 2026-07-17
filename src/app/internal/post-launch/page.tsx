import { redirect } from "next/navigation";

export default function PostLaunchIndexPage() {
  redirect("/internal/post-launch/overview");
}
