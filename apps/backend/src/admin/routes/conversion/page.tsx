// @ts-nocheck -- Medusa Admin compiles React 18 separately from the workspace React 19 types.
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type Review = {
  id: string;
  author_name: string;
  title?: string;
  body: string;
  rating: number;
  status: "pending" | "published" | "rejected";
  verified_purchase: boolean;
};

const ConversionPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [merchandisingCount, setMerchandisingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [reviewResponse, merchandisingResponse] = await Promise.all([
        fetch("/admin/conversion/reviews", { credentials: "include" }),
        fetch("/admin/conversion/merchandising", { credentials: "include" }),
      ]);
      const reviewPayload = await reviewResponse.json();
      const merchandisingPayload = await merchandisingResponse.json();
      setReviews(reviewPayload.reviews || []);
      setMerchandisingCount(merchandisingPayload.merchandising?.length || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id: string, status: Review["status"]) => {
    const response = await fetch("/admin/conversion/reviews", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      toast.error("Review kon niet worden bijgewerkt");
      return;
    }
    toast.success("Review bijgewerkt");
    await load();
  };

  return (
    <div className="flex flex-col gap-3">
      <Container className="flex items-center justify-between p-6">
        <div>
          <Heading level="h1">Conversiecentrum</Heading>
          <Text className="text-ui-fg-subtle">
            Reviews, merchandising, bundels en productstaffels.
          </Text>
        </div>
        <Badge color="green">{merchandisingCount} producten ingericht</Badge>
      </Container>

      <Container className="p-0">
        <div className="border-b p-6">
          <Heading level="h2">Reviewmoderatie</Heading>
        </div>
        {loading ? (
          <Text className="p-6 text-ui-fg-subtle">Laden...</Text>
        ) : reviews.length ? (
          <div className="divide-y">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="grid gap-4 p-6 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Text weight="plus">{review.author_name}</Text>
                    <Badge color={review.verified_purchase ? "green" : "grey"}>
                      {review.verified_purchase ? "Verified" : "Niet verified"}
                    </Badge>
                    <Badge>{review.rating}/5</Badge>
                  </div>
                  {review.title && (
                    <Text weight="plus" className="mt-3">
                      {review.title}
                    </Text>
                  )}
                  <Text className="mt-1 text-ui-fg-subtle">{review.body}</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => moderate(review.id, "rejected")}
                  >
                    Afwijzen
                  </Button>
                  <Button
                    size="small"
                    onClick={() => moderate(review.id, "published")}
                  >
                    Publiceren
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text className="p-6 text-ui-fg-subtle">
            Nog geen reviews om te modereren.
          </Text>
        )}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Conversie",
  icon: ChartBar,
});

export default ConversionPage;
