import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

export enum EnititySupportType {
  Http,
  Rpc,
  GraphQL,
}

export interface SupportedChainEntity {
  table: string;
  table_group_by: string;
  support?: EnititySupportType[];
}

export interface SupportedChain {
  chain: string;
  chainEntities: SupportedChainEntity[];
}

// SupportedChainDoc type will represent the document structure
export type SupportedChainDoc = Schema["chainSupports"]["Doc"];
export type SupportedChainResult = Result<SupportedChain>;

export class SupportedChainService {
  /**
   * Creates a new supported chain.
   * @param chain The chain name.
   * @returns ServiceResult<SupportedChainResult> The created chain or error.
   */
  static async create(
    chain: string
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      const ref = await db.chainSupports.add({
        chain,
        chainEntities: [],
      });

      const chainSnapshot = await db.chainSupports.get(ref.id);
      if (!chainSnapshot) {
        return {
          success: false,
          message: "Failed to retrieve created chain.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<SupportedChain>(chainSnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating supported chain.",
        code: "DB_INSERT_ERROR",
        details: error,
      };
    }
  }

  /**
   * Finds a supported chain by name.
   * @param chain The name of the chain.
   * @returns ServiceResult<SupportedChainResult> The found chain or error.
   */
  static async findByChain(
    chain: string
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );
      if (chainSnapshot.length === 0) {
        return {
          success: false,
          message: "Chain not found.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: toResult<SupportedChain>(chainSnapshot[0]),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error finding supported chain.",
        code: "DB_QUERY_ERROR",
        details: error,
      };
    }
  }

  /**
   * Deletes a supported chain by name.
   * @param chain The name of the chain to delete.
   * @returns ServiceResult<boolean> Success or failure.
   */
  static async delete(chain: string): Promise<ServiceResult<boolean>> {
    try {
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );
      if (chainSnapshot.length === 0) {
        return {
          success: false,
          message: "Chain not found.",
          code: "NOT_FOUND",
        };
      }

      await db.chainSupports.remove(chainSnapshot[0].ref.id);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting supported chain.",
        code: "DB_DELETE_ERROR",
        details: error,
      };
    }
  }

  /**
   * Retrieves all supported chains.
   * @returns ServiceResult<SupportedChainResult[]> List of supported chains or error.
   */
  static async getAll(): Promise<ServiceResult<SupportedChainResult[]>> {
    try {
      const chainsSnapshot = await db.chainSupports.all();
      if (chainsSnapshot.length === 0) {
        return {
          success: false,
          message: "No supported chains found.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: chainsSnapshot.map(doc => toResult<SupportedChain>(doc)),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving all supported chains.",
        code: "DB_QUERY_ERROR",
        details: error,
      };
    }
  }

  /**
   * Adds a new SupportedChainEntity to an existing SupportedChain.
   * @param chain The name of the chain to add the entity to.
   * @param table The table name of the entity.
   * @param table_group_by The table group for the entity.
   * @param support Types of support (HTTP, RPC, GraphQL).
   * @returns ServiceResult<SupportedChainResult> The updated chain or error.
   */
  static async addChainEntity(
    chain: string,
    table: string,
    tableGroupBy: string,
    support: EnititySupportType[]
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      // Find the existing supported chain
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );

      if (chainSnapshot.length === 0) {
        return {
          success: false,
          message: "Chain not found.",
          code: "NOT_FOUND",
        };
      }
      const chainId = chainSnapshot[0].ref.id;

      // Retrieve the chain entity
      const existingChain = toResult<SupportedChain>(chainSnapshot[0]);

      // Create a new SupportedChainEntity
      const newChainEntity: SupportedChainEntity = {
        table,
        table_group_by: tableGroupBy,
        support,
      };

      // Add the new SupportedChainEntity to the chain's `chainEntities`
      existingChain.chainEntities.push(newChainEntity);

      // Update the supported chain with the new entity
      await db.chainSupports.update(chainId, () => ({
        chainEntities: existingChain.chainEntities,
      }));

      // Retrieve the updated chain
      const updatedChainSnapshot = await db.chainSupports.get(chainId);
      if (!updatedChainSnapshot) {
        return {
          success: false,
          message: "Failed to retrieve the updated chain.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<SupportedChain>(updatedChainSnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error adding chain entity.",
        code: "DB_UPDATE_ERROR",
        details: error,
      };
    }
  }
}
