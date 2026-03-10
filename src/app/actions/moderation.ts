"use server";

import { ItemReportStatus, ItemStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { actionFail, actionOk } from "@/lib/actions/result";
import { getCurrentUser } from "@/lib/auth";
import { invalidateCachePattern } from "@/lib/cache";
import { notifyUser } from "@/lib/notify";
import prisma from "@/lib/prisma";

const MODERATOR_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.MODERATOR]);
const REPORT_STATUSES = new Set<ItemReportStatus>([
  ItemReportStatus.REVIEWED,
  ItemReportStatus.REJECTED,
  ItemReportStatus.ACTIONED,
]);

type ModerationItemAction = "KEEP" | "REMOVE";

export async function updateItemReportStatus(input: {
  reportId: string;
  status: ItemReportStatus;
  itemAction: ModerationItemAction;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return actionFail("auth_required");
  }

  if (!MODERATOR_ROLES.has(user.role)) {
    return actionFail("moderation_forbidden");
  }

  const reportId = input.reportId.trim();
  if (!reportId) {
    return actionFail("report_not_found");
  }

  if (!REPORT_STATUSES.has(input.status)) {
    return actionFail("invalid_report_status");
  }

  if (input.itemAction !== "KEEP" && input.itemAction !== "REMOVE") {
    return actionFail("invalid_item_action");
  }

  const report = await prisma.itemReport.findUnique({
    where: { id: reportId },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          status: true,
          owner: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      reporter: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!report) {
    return actionFail("report_not_found");
  }

  const nextStatus = input.status;
  const shouldRemoveItem = input.itemAction === "REMOVE";

  try {
    await prisma.$transaction(async (tx) => {
      await tx.itemReport.update({
        where: { id: report.id },
        data: {
          status: nextStatus,
        },
      });

      if (shouldRemoveItem && report.item.status !== ItemStatus.REMOVED) {
        await tx.item.update({
          where: { id: report.item.id },
          data: {
            status: ItemStatus.REMOVED,
          },
        });
      }
    });

    if (shouldRemoveItem && report.item.owner.email) {
      await notifyUser({
        userId: report.item.owner.id,
        email: report.item.owner.email,
        template: "item_removed_after_review",
        payload: {
          itemTitle: report.item.title,
        },
        link: "/profile/items",
      });
    }

    if (nextStatus === ItemReportStatus.REJECTED && report.reporter.email) {
      await notifyUser({
        userId: report.reporter.id,
        email: report.reporter.email,
        template: "report_reviewed_without_action",
        payload: {
          itemTitle: report.item.title,
        },
        link: `/item/${report.item.id}`,
      });
    }

    invalidateCachePattern("discovery:");
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/profile/items");
    revalidatePath("/profile/moderation");
    revalidatePath(`/item/${report.item.id}`);

    return actionOk("report_status_updated", {
      removedItem: shouldRemoveItem,
      status: nextStatus,
    });
  } catch {
    return actionFail("unexpected_error");
  }
}
