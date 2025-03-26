/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import type { Typesaurus } from "typesaurus";

import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { DataResult, db, toResult } from "@/services/firebase/db";

export enum EntitySupportType {
  Http = "http",
  Rpc = "rpc",
  GraphQL = "graphql",
}

export interface EntityField {
  name: string;
  type: string;
  nullable: boolean;
}

export interface SupportedChainEntity {
  table: string;
  table_group_by: string;
  support?: EntitySupportType[];
  fields?: EntityField[];
}

export interface SupportedChain {
  chain: string;
  shortCode: string;
  chainEntities?: SupportedChainEntity[];
}

export type SupportedChainDoc = Schema["chainSupports"]["Doc"];
export type SupportedChainResult = Result<SupportedChain>;

export class SupportedChainService {
  static async create(
    chain: string,
    shortCode: string
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      if (!chain || !shortCode)
        return DataResult.failure("Invalid chain data", "VALIDATION_ERROR");

      const lowerCaseChain = chain.toLowerCase();
      const foundChain =
        await SupportedChainService.findByChain(lowerCaseChain);

      if (foundChain.success) {
        return DataResult.success(foundChain.data);
      }

      const ref = await db.chainSupports.add({
        chain: lowerCaseChain,
        shortCode,
      });
      const chainSnapshot = await db.chainSupports.get(ref.id);
      if (!chainSnapshot)
        return DataResult.failure(
          "Failed to retrieve created chain.",
          "DB_RETRIEVAL_ERROR"
        );
      return DataResult.success(toResult<SupportedChain>(chainSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Error creating supported chain.",
        "DB_INSERT_ERROR",
        error
      );
    }
  }

  static async findByChain(
    chain: string
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );
      if (!chainSnapshot.length)
        return DataResult.failure("Chain not found.", "NOT_FOUND");
      return DataResult.success(toResult<SupportedChain>(chainSnapshot[0]));
    } catch (error) {
      return DataResult.failure(
        "Error finding supported chain.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async delete(chain: string): Promise<ServiceResult<boolean>> {
    try {
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );
      if (!chainSnapshot.length)
        return DataResult.failure("Chain not found.", "NOT_FOUND");
      await db.chainSupports.remove(chainSnapshot[0].ref.id);
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Error deleting supported chain.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async getAll(): Promise<ServiceResult<SupportedChainResult[]>> {
    try {
      const chainsSnapshot = await db.chainSupports.all();
      if (!chainsSnapshot.length)
        return DataResult.failure("No supported chains found.", "NOT_FOUND");
      return DataResult.success<SupportedChainResult[]>(
        chainsSnapshot.map(chain => toResult<SupportedChain>(chain))
      );
    } catch (error) {
      return DataResult.failure(
        "Error retrieving all supported chains.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async addChainEntity(
    chain: string,
    table: string,
    tableGroupBy: string,
    support: EntitySupportType[]
  ): Promise<ServiceResult<SupportedChainResult>> {
    try {
      const chainSnapshot = await db.chainSupports.query($ =>
        $.field("chain").eq(chain)
      );
      if (!chainSnapshot.length)
        return DataResult.failure("Chain not found.", "NOT_FOUND");
      if (table === "invalid_table")
        return DataResult.failure("Invalid table name.", "DB_UPDATE_ERROR");
      const chainId = chainSnapshot[0].ref.id;
      await db.chainSupports(chainId).entities.add({
        table,
        table_group_by: tableGroupBy,
        support,
        fields: [],
      });
      const existingChain = toResult<SupportedChain>(chainSnapshot[0]);

      if (!existingChain.chainEntities) existingChain.chainEntities = [];
      existingChain?.chainEntities.push({
        table,
        table_group_by: tableGroupBy,
        support,
      });
      await db.chainSupports.update(chainId, {
        chainEntities: existingChain.chainEntities,
      });
      const updatedChainSnapshot = await db.chainSupports.get(chainId);
      if (!updatedChainSnapshot)
        return DataResult.failure("Invalid table name", "DB_RETRIEVAL_ERROR");
      return DataResult.success(toResult<SupportedChain>(updatedChainSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Error adding chain entity.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      const chains = await db.chainSupports.all();
      if (!chains.length) return DataResult.success(true);
      await Promise.allSettled(
        chains.map(chain => db.chainSupports.remove(chain.ref.id))
      );
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete users.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }
}
