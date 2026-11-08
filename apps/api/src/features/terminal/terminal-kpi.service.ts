import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalKpiEntity,
  TerminalKpiValueEntity,
  TerminalMemberEntity,
} from '@sandworm/postgresql-typeorm';
import {
  DEFAULT_KPI_COMPARISON,
  DEFAULT_KPI_FORMAT,
  DEFAULT_KPI_SOURCE,
  KPI_DIRECTIONS,
  KpiComparison,
  KpiFormat,
  KpiSettings,
  KpiSource,
  buildKpi,
  type ClientStatusId,
  type KpiDirection,
  type KpiDisplay,
  type KpiReading,
  type OrganisationTypeId,
} from '@sandworm/types/terminal';
import { In, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { z } from 'zod';
import { StaffService } from '../staff/staff.service';
import type { TerminalKpiInput, TerminalKpiValueInput } from './terminal.model';

const TEAM_ONLY = 'The terminal team tools are for the Sandworm team';
const DAY = 24 * 60 * 60 * 1000;
// A year-ago comparison needs readings from a year back, and a month of slack
const HISTORY_DAYS = 400;
const KEY = /^[a-z0-9][a-z0-9-]{0,63}$/;

export type OverviewKpis = { clientType: OrganisationTypeId; clientStatus: ClientStatusId; kpis: KpiDisplay[] };

export type KpiDefinitionData = {
  id: string;
  subjectId: string | null;
  key: string;
  label: string;
  description: string;
  position: number;
  isVisible: boolean;
  format: KpiFormat;
  direction: KpiDirection;
  comparison: KpiComparison;
  source: KpiSource;
  settings: KpiSettings;
  display: KpiDisplay;
  lastReadingAt: string | null;
};

// The input says what is wrong in the words of the schema, so a caller can fix it
function parsed<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw new BadRequestException(`${what}: ${result.error.issues.map(issue => `${issue.path.join('.') || 'value'} ${issue.message}`).join('; ')}`);
}

// Key numbers: what a client's members read, and what the team edits.
@Injectable()
export class TerminalKpiService {
  constructor(
    @InjectRepository(TerminalKpiEntity)
    private readonly kpis: Repository<TerminalKpiEntity>,
    @InjectRepository(TerminalKpiValueEntity)
    private readonly values: Repository<TerminalKpiValueEntity>,
    @InjectRepository(TerminalMemberEntity)
    private readonly members: Repository<TerminalMemberEntity>,
    @InjectRepository(TerminalClientEntity)
    private readonly clients: Repository<TerminalClientEntity>,
    private readonly staff: StaffService,
  ) {}

  // The numbers on the Overview of the client the user belongs to. Null when
  // they are not part of one yet.
  async overview(userId: string): Promise<OverviewKpis | null> {
    const member = await this.members.findOne({ where: { userId }, order: { createdAt: 'ASC' } });
    if (!member) return null;
    const client = await this.clients.findOneBy({ id: member.clientId });
    if (!client) return null;

    const definitions = await this.kpis.find({
      where: { clientId: client.id, subjectId: IsNull(), isVisible: true },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    const readings = await this.readingsOf(definitions.map(definition => definition.id));

    return {
      clientType: client.type as OrganisationTypeId,
      clientStatus: client.status as ClientStatusId,
      kpis: definitions.map(definition => this.display(definition, readings.get(definition.id) ?? [])),
    };
  }

  // Every KPI of a client, hidden ones too, as the team edits them. Staff only.
  async clientKpis(staffId: string, clientId: string): Promise<KpiDefinitionData[]> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const definitions = await this.kpis.find({
      where: { clientId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
    const readings = await this.readingsOf(definitions.map(definition => definition.id));
    return definitions.map(definition => this.toData(definition, readings.get(definition.id) ?? []));
  }

  // Creates the KPI with this key, or changes it: what is not sent stays. Staff only.
  async saveKpi(staffId: string, clientId: string, input: TerminalKpiInput): Promise<KpiDefinitionData> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);
    if (!KEY.test(input.key)) {
      throw new BadRequestException('A key is lowercase letters, numbers and dashes, such as "swap-volume"');
    }
    if (!(await this.clients.exist({ where: { id: clientId } }))) throw new NotFoundException('No such client');

    const subjectId = input.subjectId ?? null;
    const existing = await this.kpis.findOne({
      where: { clientId, subjectId: subjectId ?? IsNull(), key: input.key },
    });
    const kpi = existing ?? this.kpis.create({ clientId, subjectId, key: input.key });

    if (input.label !== undefined) kpi.label = input.label;
    if (!kpi.label) throw new BadRequestException('A new key number needs a label');
    if (input.description !== undefined) kpi.description = input.description;
    if (input.position !== undefined) kpi.position = input.position;
    if (input.isVisible !== undefined) kpi.isVisible = input.isVisible;
    if (input.direction !== undefined) {
      if (!KPI_DIRECTIONS.includes(input.direction as KpiDirection)) {
        throw new BadRequestException(`direction is one of ${KPI_DIRECTIONS.join(', ')}`);
      }
      kpi.direction = input.direction as KpiDirection;
    }
    kpi.format = input.format !== undefined ? parsed(KpiFormat, input.format, 'format') : (kpi.format ?? DEFAULT_KPI_FORMAT);
    kpi.comparison =
      input.comparison !== undefined ? parsed(KpiComparison, input.comparison, 'comparison') : (kpi.comparison ?? DEFAULT_KPI_COMPARISON);
    kpi.source = input.source !== undefined ? parsed(KpiSource, input.source, 'source') : (kpi.source ?? DEFAULT_KPI_SOURCE);
    kpi.settings = input.settings !== undefined ? parsed(KpiSettings, input.settings, 'settings') : (kpi.settings ?? {});

    const saved = await this.kpis.save(kpi);
    return this.toData(saved, (await this.readingsOf([saved.id])).get(saved.id) ?? []);
  }

  async deleteKpi(staffId: string, kpiId: string): Promise<boolean> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const { affected } = await this.kpis.delete({ id: kpiId });
    if (!affected) throw new NotFoundException('No such key number');
    return true;
  }

  // Records a reading by hand, replacing the one for the same date. Staff only.
  async recordValue(staffId: string, kpiId: string, input: TerminalKpiValueInput): Promise<KpiDefinitionData> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const kpi = await this.kpis.findOneBy({ id: kpiId });
    if (!kpi) throw new NotFoundException('No such key number');

    const value = input.value ?? null;
    const textValue = input.textValue?.trim() || null;
    if (value === null && textValue === null) throw new BadRequestException('Send a value or a textValue');

    const asOf = input.asOf ? new Date(input.asOf) : startOfToday();
    if (Number.isNaN(asOf.getTime())) throw new BadRequestException('asOf is not a date');

    await this.values.upsert(
      { kpiId, asOf, value, textValue, previous: input.previous ?? null, meta: {}, recordedBy: staffId },
      ['kpiId', 'asOf'],
    );
    return this.toData(kpi, (await this.readingsOf([kpiId])).get(kpiId) ?? []);
  }

  // Readings from the last year or so, newest first, by KPI
  private async readingsOf(kpiIds: string[]): Promise<Map<string, KpiReading[]>> {
    const byKpi = new Map<string, KpiReading[]>();
    if (kpiIds.length === 0) return byKpi;

    const rows = await this.values.find({
      where: { kpiId: In(kpiIds), asOf: MoreThanOrEqual(new Date(Date.now() - HISTORY_DAYS * DAY)) },
      order: { asOf: 'DESC' },
    });
    for (const row of rows) {
      const list = byKpi.get(row.kpiId) ?? [];
      list.push({ asOf: row.asOf.toISOString(), value: row.value, textValue: row.textValue, previous: row.previous });
      byKpi.set(row.kpiId, list);
    }
    return byKpi;
  }

  private display(kpi: TerminalKpiEntity, readings: KpiReading[]): KpiDisplay {
    return buildKpi(
      { key: kpi.key, label: kpi.label, format: kpi.format, direction: kpi.direction, comparison: kpi.comparison },
      readings,
    );
  }

  private toData(kpi: TerminalKpiEntity, readings: KpiReading[]): KpiDefinitionData {
    return {
      id: kpi.id,
      subjectId: kpi.subjectId,
      key: kpi.key,
      label: kpi.label,
      description: kpi.description,
      position: kpi.position,
      isVisible: kpi.isVisible,
      format: kpi.format,
      direction: kpi.direction,
      comparison: kpi.comparison,
      source: kpi.source,
      settings: kpi.settings,
      display: this.display(kpi, readings),
      lastReadingAt: readings[0]?.asOf ?? null,
    };
  }
}

function startOfToday(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}
