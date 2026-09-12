import { query } from "../db/client.js";
import { toIso, toNumber } from "../db/coerce.js";

type ShipmentRow = {
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  delivered_at: Date | null;
  gps_lat: string | null;
  gps_lng: string | null;
  registered_lat: string | null;
  registered_lng: string | null;
  distance_meters: string | null;
  delivery_method: string | null;
};

export type TrackingFacts = {
  found: boolean;
  order_id: string;
  carrier?: string;
  tracking_number?: string;
  status?: string;
  delivered_at?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  registered_lat?: number | null;
  registered_lng?: number | null;
  distance_meters?: number | null;
  delivery_method?: string | null;
};

export async function findShipmentByOrderId(
  orderId: string
): Promise<TrackingFacts> {
  const result = await query<ShipmentRow>(
    `SELECT order_id, carrier, tracking_number, status, delivered_at,
            gps_lat::text AS gps_lat, gps_lng::text AS gps_lng,
            registered_lat::text AS registered_lat,
            registered_lng::text AS registered_lng,
            distance_meters::text AS distance_meters, delivery_method
     FROM shipments WHERE order_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [orderId]
  );
  const row = result.rows[0];
  if (!row) {
    return { found: false, order_id: orderId };
  }
  return {
    found: true,
    order_id: row.order_id,
    carrier: row.carrier,
    tracking_number: row.tracking_number,
    status: row.status,
    delivered_at: toIso(row.delivered_at),
    gps_lat: toNumber(row.gps_lat),
    gps_lng: toNumber(row.gps_lng),
    registered_lat: toNumber(row.registered_lat),
    registered_lng: toNumber(row.registered_lng),
    distance_meters: toNumber(row.distance_meters),
    delivery_method: row.delivery_method,
  };
}
