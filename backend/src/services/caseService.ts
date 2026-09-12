import { AppError } from "../middleware/errorHandler.js";
import { findCaseById, listDemoCases } from "../repositories/caseRepository.js";
import { findShipmentByOrderId } from "../repositories/shipmentRepository.js";
import { findDeliveryEvidenceByOrderId } from "../repositories/deliveryEvidenceRepository.js";

export async function listCases() {
  return listDemoCases();
}

export async function getCaseById(caseId: string) {
  const row = await findCaseById(caseId);
  if (!row) {
    throw new AppError(404, `Case ${caseId} not found`, "CASE_NOT_FOUND");
  }

  const [tracking, delivery_evidence] = await Promise.all([
    findShipmentByOrderId(row.order_id),
    findDeliveryEvidenceByOrderId(row.order_id),
  ]);

  return {
    ...row,
    ops: {
      tracking,
      delivery_evidence,
    },
  };
}
