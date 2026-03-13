"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type PublishStoryData = {
  imageUrl: string;
  caption?: string;
  type?: "showcase" | "auction";
};

export async function publishStory(data: PublishStoryData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await prisma.story.create({
    data: {
      userId: user.id,
      imageUrl: data.imageUrl,
      caption: data.caption,
      type: data.type || "showcase",
      expiresAt,
    },
  });

  revalidatePath("/");
  return { ok: true, story };
}

export async function getActiveStories() {
  const now = new Date();
  
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: now },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return stories;
}

export async function deleteStory(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const story = await prisma.story.findUnique({
    where: { id },
  });

  if (!story || story.userId !== user.id) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.story.delete({
    where: { id },
  });

  revalidatePath("/");
  return { ok: true };
}
