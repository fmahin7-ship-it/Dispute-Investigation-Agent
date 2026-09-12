"use client";

type TrackingOps = {
  found: boolean;
  order_id: string;
  carrier?: string;
  tracking_number?: string;
  status?: string;
  delivered_at?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  distance_meters?: number | null;
  delivery_method?: string | null;
};

type DeliveryOps = {
  found: boolean;
  order_id: string;
  exists: boolean;
  url: string | null;
  caption: string | null;
  limitations: string[];
  captured_at?: string | null;
};

type Props = {
  tracking?: TrackingOps | null;
  delivery?: DeliveryOps | null;
};

function photoSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

/** Carrier GPS + delivery photo — shown after Investigate for demo proof. */
export function DeliveryOpsPanel({ tracking, delivery }: Props) {
  const hasTracking = Boolean(tracking?.found);
  const hasPhoto = Boolean(delivery?.exists && delivery.url);
  if (!hasTracking && !hasPhoto && !delivery?.found) return null;

  const src = photoSrc(delivery?.url ?? null);
  const distance = tracking?.distance_meters;
  const proximityLabel =
    distance == null
      ? null
      : distance <= 50
        ? "Near address"
        : distance <= 200
          ? "Neighbourhood band"
          : "Far from registered point";

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Carrier evidence · GPS & photo
      </h3>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          {hasTracking ? (
            <>
              <p>
                <span className="font-semibold text-ink">Status:</span>{" "}
                {tracking?.status ?? "—"}
                {tracking?.carrier ? ` · ${tracking.carrier}` : ""}
              </p>
              {tracking?.tracking_number ? (
                <p className="text-slate-600">
                  Tracking {tracking.tracking_number}
                </p>
              ) : null}
              {tracking?.delivered_at ? (
                <p className="text-slate-600">
                  Delivered{" "}
                  {new Date(tracking.delivered_at).toLocaleString()}
                </p>
              ) : null}
              {tracking?.delivery_method ? (
                <p className="text-slate-600">
                  Method: {tracking.delivery_method.replace(/_/g, " ")}
                </p>
              ) : null}
              {distance != null ? (
                <div className="rounded-lg border border-slate-100 bg-panel px-3 py-2">
                  <p className="font-semibold text-ink">
                    GPS proximity: {Math.round(distance)} m
                  </p>
                  {proximityLabel ? (
                    <p className="text-xs text-slate-500">{proximityLabel}</p>
                  ) : null}
                  {tracking?.gps_lat != null && tracking?.gps_lng != null ? (
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      Drop: {tracking.gps_lat.toFixed(5)},{" "}
                      {tracking.gps_lng.toFixed(5)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-slate-500">No GPS proximity on file.</p>
              )}
            </>
          ) : (
            <p className="text-slate-500">No shipment / GPS record.</p>
          )}
        </div>

        <div>
          {hasPhoto && src ? (
            <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={delivery?.caption ?? "Delivery photo"}
                className="max-h-56 w-full object-cover"
              />
              <figcaption className="space-y-1 px-3 py-2 text-xs text-slate-600">
                <p>{delivery?.caption}</p>
                {delivery?.limitations && delivery.limitations.length > 0 ? (
                  <ul className="list-disc pl-4 text-amber-900/80">
                    {delivery.limitations.map((lim) => (
                      <li key={lim}>{lim}</li>
                    ))}
                  </ul>
                ) : null}
              </figcaption>
            </figure>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
              No delivery photo on file for this order.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
