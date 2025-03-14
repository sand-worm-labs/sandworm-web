import type { Result } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

export interface Organization {
  name: string;
  walletAddress: string;
  recoveryAddress?: string;
}
export class OrganizationService {
  /**
   * Retrieves all organizations from Firestore.
   */
  static async findAll(): Promise<Result<Organization>[]> {
    try {
      const organizationsSnapshot = await db.organizations.all();
      return organizationsSnapshot.map(org => toResult<Organization>(org));
    } catch (error) {
      console.error("Error fetching all organizations:", error);
      return [];
    }
  }

  /**
   * Finds an organization by wallet address.
   */
  static async findByAddress(
    address: string
  ): Promise<Result<Organization> | null> {
    try {
      const organizationSnapshot = await db.organizations.get(
        db.organizations.id(address)
      );
      return toResult<Organization>(organizationSnapshot);
    } catch (error) {
      console.error(`Error fetching organization ${address}:`, error);
      return null;
    }
  }

  /**
   * Creates a new organization in Firestore.
   */
  static async create(
    name: string,
    walletAddress: string
  ): Promise<Result<Organization> | null> {
    try {
      const organizationAddress = db.organizations.id(walletAddress);
      const ref = await db.organizations.set(organizationAddress, () => ({
        name,
        walletAddress,
      }));

      const organizationSnapshot = await db.organizations.get(ref.id);
      return toResult<Organization>(organizationSnapshot);
    } catch (error) {
      console.error("Error creating organization:", error);
      return null;
    }
  }

  /**
   * Updates an existing organization's details.
   */
  static async update(
    name: string,
    walletAddress: string
  ): Promise<Result<Organization> | null> {
    try {
      const organizationRef = db.organizations.id(walletAddress);
      const organizationSnapshot = await db.organizations.get(organizationRef);

      if (!organizationSnapshot) {
        console.warn(`Organization ${walletAddress} not found.`);
        return null;
      }

      await organizationSnapshot.ref.update(() => ({
        name,
        walletAddress,
      }));

      return toResult<Organization>(organizationSnapshot);
    } catch (error) {
      console.error(`Error updating organization ${walletAddress}:`, error);
      return null;
    }
  }
}
