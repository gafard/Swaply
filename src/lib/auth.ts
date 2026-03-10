import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  let user = await prisma.user.findUnique({
    where: { email: authUser.email! },
  });

  if (!user) {
    let baseUsername = authUser.email!.split("@")[0];
    let username = baseUsername;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (!existing) {
        isUnique = true;
      } else {
        username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
        attempts++;
      }
    }

    user = await prisma.user.create({
      data: {
        email: authUser.email!,
        username,
        credits: 100,
        trustScore: 0,
      },
    });
  }

  return user;
}
