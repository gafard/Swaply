import "dotenv/config";

import prisma from "../src/lib/prisma";
import {
  isNotificationTemplate,
  type NotificationPayloadMap,
  type NotificationTemplate,
} from "../src/lib/notification-templates";

type LegacyNotification = {
  id: string;
  title: string | null;
  body: string | null;
  type: string | null;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuotedValue(text: string | null | undefined) {
  const match = (text ?? "").match(/"([^"]+)"/);
  return match?.[1] ?? null;
}

function extractBefore(
  text: string | null | undefined,
  normalizedNeedle: string
) {
  const raw = text ?? "";
  const normalizedRaw = normalizeText(raw);
  const index = normalizedRaw.indexOf(normalizedNeedle);

  if (index <= 0) {
    return null;
  }

  return raw.slice(0, index).trim();
}

function inferTemplate(
  notification: LegacyNotification
):
  | {
      template: NotificationTemplate;
      payload: NotificationPayloadMap[NotificationTemplate];
    }
  | null {
  if (notification.type && isNotificationTemplate(notification.type)) {
    return null;
  }

  const title = normalizeText(notification.title);
  const body = normalizeText(notification.body);
  const legacyType = (notification.type ?? "").toUpperCase();
  const itemTitle = extractQuotedValue(notification.body) ?? extractQuotedValue(notification.title);

  if (
    legacyType === "ITEM_RESERVED" ||
    title.includes("nouvelle proposition de troc") ||
    title.includes("new trade request")
  ) {
    const username = extractBefore(notification.body, ' a reserve "') ?? "Unknown";
    if (itemTitle) {
      return {
        template: "exchange_reserved",
        payload: {
          username,
          itemTitle,
        },
      };
    }
  }

  if (
    legacyType === "EXCHANGE_CONFIRMED" ||
    title.includes("echange valide") ||
    title.includes("exchange confirmed")
  ) {
    if (itemTitle) {
      return {
        template: "exchange_confirmed",
        payload: { itemTitle },
      };
    }
  }

  if (
    legacyType === "NEW_MESSAGE" ||
    title.includes("nouveau message") ||
    title.includes("new message")
  ) {
    const username =
      extractBefore(notification.body, ' vous a ecrit au sujet de "') ??
      extractBefore(notification.body, ' sent you a message about "') ??
      "Unknown";

    if (itemTitle) {
      return {
        template: "new_message",
        payload: {
          username,
          itemTitle,
        },
      };
    }
  }

  if (title.includes("nouvel objet pres de chez vous") || title.includes("new item near you")) {
    const zoneNameMatch =
      (notification.body ?? "").match(/(?:publie a|published in) (.+)\.?$/i) ?? null;

    if (itemTitle) {
      return {
        template: "new_local_item",
        payload: {
          itemTitle,
          zoneName: zoneNameMatch?.[1]?.trim() ?? null,
        },
      };
    }
  }

  if (title.includes("un objet a ete signale") || title.includes("an item was reported")) {
    if (itemTitle) {
      return {
        template: "item_reported_owner",
        payload: { itemTitle },
      };
    }
  }

  if (
    title.includes("votre annonce a ete retiree") ||
    title.includes("your listing was removed")
  ) {
    if (itemTitle) {
      return {
        template: "item_removed_after_review",
        payload: { itemTitle },
      };
    }
  }

  if (title.includes("signalement examine") || title.includes("report reviewed")) {
    if (itemTitle) {
      return {
        template: "report_reviewed_without_action",
        payload: { itemTitle },
      };
    }
  }

  if (
    legacyType === "RESERVATION_EXPIRED" ||
    title.includes("reservation expiree") ||
    title.includes("reservation expired")
  ) {
    if (itemTitle) {
      const isOwnerVariant =
        body.includes("a nouveau disponible") || body.includes("available again");

      return {
        template: isOwnerVariant
          ? "reservation_expired_owner"
          : "reservation_expired_requester",
        payload: { itemTitle },
      };
    }
  }

  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ type: null }, { title: { not: null } }, { body: { not: null } }],
    },
    select: {
      id: true,
      title: true,
      body: true,
      type: true,
    },
  });

  let migrated = 0;
  let skipped = 0;

  for (const notification of notifications) {
    const inferred = inferTemplate(notification);
    if (!inferred) {
      skipped += 1;
      continue;
    }

    migrated += 1;

    if (dryRun) {
      console.log(
        JSON.stringify(
          {
            id: notification.id,
            inferred,
          },
          null,
          2
        )
      );
      continue;
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        type: inferred.template,
        payload: inferred.payload as any,
        title: null,
        body: null,
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        scanned: notifications.length,
        migrated,
        skipped,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
