"use client";

import { useState, useTransition } from "react";
import { ItemReportStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { updateItemReportStatus } from "@/app/actions/moderation";

type ModerationItemAction = "KEEP" | "REMOVE";

export default function ReportDecisionButtons({ reportId }: { reportId: string }) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("moderation.actions");

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "moderation_forbidden":
        return t("errors.forbidden");
      case "report_not_found":
        return t("errors.reportNotFound");
      case "invalid_report_status":
        return t("errors.invalidStatus");
      case "invalid_item_action":
        return t("errors.invalidAction");
      default:
        return t("errors.generic");
    }
  };

  const handleAction = (status: ItemReportStatus, itemAction: ModerationItemAction) => {
    const actionKey = `${status}:${itemAction}`;
    setPendingAction(actionKey);

    startTransition(async () => {
      try {
        const result = await updateItemReportStatus({
          reportId,
          status,
          itemAction,
        });

        if (!result.ok) {
          toast.error(getErrorMessage(result.code));
          return;
        }

        toast.success(
          result.data?.removedItem ? t("success.removed") : t("success.updated")
        );
      } catch {
        toast.error(t("errors.generic"));
      } finally {
        setPendingAction(null);
      }
    });
  };

  const isDisabled = isPending && pendingAction !== null;

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => handleAction(ItemReportStatus.REVIEWED, "KEEP")}
        disabled={isDisabled}
        className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === `${ItemReportStatus.REVIEWED}:KEEP`
          ? t("loading")
          : t("reviewWithoutAction")}
      </button>

      <button
        type="button"
        onClick={() => handleAction(ItemReportStatus.REJECTED, "KEEP")}
        disabled={isDisabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === `${ItemReportStatus.REJECTED}:KEEP`
          ? t("loading")
          : t("reject")}
      </button>

      <button
        type="button"
        onClick={() => handleAction(ItemReportStatus.ACTIONED, "REMOVE")}
        disabled={isDisabled}
        className="w-full rounded-2xl border border-rose-100 bg-rose-500 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === `${ItemReportStatus.ACTIONED}:REMOVE`
          ? t("loading")
          : t("removeListing")}
      </button>
    </div>
  );
}
