import type { Result, Schema } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

export interface Employee {
  name: string;
  title: string;
  employmentType: string;
  walletAddress: string;
  additionalWallets: string[];
  email: string;
  status: boolean;
  estimatedSalary: number;
  employerNotes: string;
  createdBy: string;
  organisationId: string;
}

type Option<T> = T | null;

export type EmployerDoc = Schema["organizations"]["Doc"];
export type EmployerResult = Result<Employee>;

export class EmployeeService {
  /**
   * Finds all employees under the specified organization.
   */
  static async findAll(organizationId: string): Promise<EmployerResult[]> {
    try {
      const org = await db.organizations.get(
        db.organizations.id(organizationId)
      );
      if (!org) return [];

      const employeesSnapshot = await db
        .organizations(org.ref.id)
        .employees.all();
      return employeesSnapshot.map(employee => toResult<Employee>(employee));
    } catch (error) {
      console.error(`Error fetching employees for ${organizationId}:`, error);
      return [];
    }
  }

  /**
   * Finds a specific employee under the specified organization.
   */
  static async findOne(
    organizationId: string,
    employeeAddress: string
  ): Promise<Option<EmployerResult>> {
    try {
      const org = await db.organizations.get(
        db.organizations.id(organizationId)
      );
      if (!org) return null;

      const employeesRef = db.organizations(org.ref.id).employees;
      const employeeSnapshot = await employeesRef.get(
        employeesRef.id(employeeAddress)
      );

      return employeeSnapshot ? toResult<Employee>(employeeSnapshot) : null;
    } catch (error) {
      console.error(`Error fetching employee ${employeeAddress}:`, error);
      return null;
    }
  }

  /**
   * Creates an employee document under the specified organization.
   */
  static async create(
    organizationId: string,
    name: string,
    title: string,
    employmentType: string,
    walletAddress: string,
    additionalWallets: string[],
    email: string,
    status: boolean,
    estimatedSalary: number,
    employerNotes?: string
  ): Promise<Option<EmployerResult>> {
    try {
      const org = await db.organizations.get(
        db.organizations.id(organizationId)
      );
      if (!org) return null;

      const employeesRef = db.organizations(org.ref.id).employees;
      const employeeId = employeesRef.id(walletAddress);
      await employeesRef.set(employeeId, {
        name,
        title,
        employmentType,
        walletAddress,
        additionalWallets,
        email,
        status,
        estimatedSalary,
        employerNotes: employerNotes || "",
        organisationId: organizationId,
        createdBy: organizationId,
      });

      const employeeSnapshot = await employeesRef.get(employeeId);
      return employeeSnapshot ? toResult<Employee>(employeeSnapshot) : null;
    } catch (error) {
      console.error("Error creating employee:", error);
      return null;
    }
  }

  /**
   * Updates an existing employee's details.
   */
  static async update(
    organizationId: string,
    name: string,
    title: string,
    employmentType: string,
    walletAddress: string,
    additionalWallets: string[],
    email: string,
    status: boolean,
    estimatedSalary: number,
    employerNotes?: string
  ): Promise<Option<EmployerResult>> {
    try {
      const org = await db.organizations.get(
        db.organizations.id(organizationId)
      );
      if (!org) return null;

      const employeesRef = db.organizations(org.ref.id).employees;
      const employeeSnapshot = await employeesRef.get(
        employeesRef.id(walletAddress)
      );

      if (!employeeSnapshot) return null;

      // Ensure the organization is authorized to update
      const employeeData = employeeSnapshot.data;
      if (employeeData.createdBy !== organizationId) {
        console.warn(`Unauthorized update attempt by ${organizationId}`);
        return null;
      }

      await employeeSnapshot.ref.update({
        name,
        title,
        employmentType,
        walletAddress,
        additionalWallets,
        email,
        status,
        estimatedSalary,
        employerNotes: employerNotes || "",
        createdBy: organizationId, // Preserve the original creator
      });

      return toResult<Employee>(employeeSnapshot);
    } catch (error) {
      console.error("Error updating employee:", error);
      return null;
    }
  }
}
