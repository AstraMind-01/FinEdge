import { UserAddress, VerificationEvent } from "../../types";
import { userAddressStore, verificationEventsStore, delay } from "../mockData/initialData";

let userAddress = userAddressStore;
let verificationEvents = verificationEventsStore;

export const KycAddressMockService = {
  getUserAddress: async (): Promise<UserAddress> => {
    await delay(200);
    return { ...userAddress };
  },

  updateUserAddress: async (data: {
    currentAddress: string;
    permanentAddress: string;
    isSameAsCurrent: boolean;
    proofDocumentType: string;
  }): Promise<{ address: UserAddress; events: VerificationEvent[] }> => {
    await delay(400);
    const nowStr = "Just Now";
    const permAddr = data.isSameAsCurrent ? data.currentAddress : data.permanentAddress;

    userAddress = {
      currentAddress: data.currentAddress,
      permanentAddress: permAddr,
      isSameAsCurrent: data.isSameAsCurrent,
      proofDocumentType: data.proofDocumentType,
      lastUpdated: nowStr,
    };

    const newEvent: VerificationEvent = {
      id: `VE-${Date.now()}`,
      label: "Address Updated",
      date: nowStr,
      status: "completed",
      description: `Residential address updated with ${data.proofDocumentType}`,
    };

    verificationEvents.push(newEvent);
    return { address: { ...userAddress }, events: [...verificationEvents] };
  },

  getVerificationJourney: async (): Promise<VerificationEvent[]> => {
    await delay(200);
    return [...verificationEvents];
  },

  addVerificationEvent: async (label: string, description?: string): Promise<VerificationEvent[]> => {
    await delay(200);
    const newEvent: VerificationEvent = {
      id: `VE-${Date.now()}`,
      label,
      date: "Just Now",
      status: "completed",
      description: description || `${label} completed successfully`,
    };
    verificationEvents.push(newEvent);
    return [...verificationEvents];
  },
};
