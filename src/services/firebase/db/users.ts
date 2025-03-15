import type { Result, Schema } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

export interface User {
  uid: string;
  email: string;
  name: string;
  picture: string;
}

type Option<T> = T | null;

export type UserDoc = Schema["users"]["Doc"];
export type UserResult = Result<User>;

export class UserService {
  /**
   * Finds a specific employee under the specified organization.
   */
  // static async findOne(
  //   organizationId: string,
  //   employeeAddress: string
  // ): Promise<Option<EmployerResult>> {
  //   try {
  //     const org = await db.organizations.get(
  //       db.organizations.id(organizationId)
  //     );
  //     if (!org) return null;

  //     const employeesRef = db.organizations(org.ref.id).employees;
  //     const employeeSnapshot = await employeesRef.get(
  //       employeesRef.id(employeeAddress)
  //     );

  //     return employeeSnapshot ? toResult<Employee>(employeeSnapshot) : null;
  //   } catch (error) {
  //     console.error(`Error fetching employee ${employeeAddress}:`, error);
  //     return null;
  //   }
  // }

  static async findUser(uid: string): Promise<UserResult> {
    const userQuery = await db.users.query($ => $.field("uid").eq(String(uid)));
    if (userQuery.length < 0) return toResult<User>(null);
    const userData = toResult<User>(userQuery[0]);
    return userData;
  }

  /**
   * Creates an employee document under the specified organization.
   */
  static async create(
    uid: string,
    email: string,
    name: string
  ): Promise<Option<UserResult>> {
    try {
      const ref = await db.users.add({
        uid,
        email,
        name,
        picture: "",
      });
      const userSnapshot = await db.users.get(ref.id);
      return userSnapshot ? toResult<User>(userSnapshot) : null;
    } catch (error) {
      console.error("Error creating employee:", error);
      return null;
    }
  }

  /**
   * Updates an existing employee's details.
   */
  // static async update(
  //   organizationId: string,
  //   name: string,
  //   title: string,
  //   employmentType: string,
  //   walletAddress: string,
  //   additionalWallets: string[],
  //   email: string,
  //   status: boolean,
  //   estimatedSalary: number,
  //   employerNotes?: string
  // ): Promise<Option<EmployerResult>> {
  //   try {
  //     const org = await db.organizations.get(
  //       db.organizations.id(organizationId)
  //     );
  //     if (!org) return null;

  //     const employeesRef = db.organizations(org.ref.id).employees;
  //     const employeeSnapshot = await employeesRef.get(
  //       employeesRef.id(walletAddress)
  //     );

  //     if (!employeeSnapshot) return null;

  //     // Ensure the organization is authorized to update
  //     const employeeData = employeeSnapshot.data;
  //     if (employeeData.createdBy !== organizationId) {
  //       console.warn(`Unauthorized update attempt by ${organizationId}`);
  //       return null;
  //     }

  //     await employeeSnapshot.ref.update({
  //       name,
  //       title,
  //       employmentType,
  //       walletAddress,
  //       additionalWallets,
  //       email,
  //       status,
  //       estimatedSalary,
  //       employerNotes: employerNotes || "",
  //       createdBy: organizationId, // Preserve the original creator
  //     });

  //     return toResult<Employee>(employeeSnapshot);
  //   } catch (error) {
  //     console.error("Error updating employee:", error);
  //     return null;
  //   }
  // }
}
