import { IdentityRecord, FieldValue } from '../domain/IdentityRecord';
import { EvidenceRef } from '../domain/EvidenceRef';

export class IdentityResolver {
  /**
   * Merge multiple IdentityRecords into one resolved record
   * Chooses strongest value per field using confidence and repetition
   */
  static resolve(records: IdentityRecord[]): IdentityRecord {
    if (records.length === 0) return {};
    if (records.length === 1) return records[0];

    const resolved: IdentityRecord = {};

    // Resolve each field type
    resolved.fullName = this.resolveField(records.map(r => r.fullName).filter(Boolean));
    resolved.fathersName = this.resolveField(records.map(r => r.fathersName).filter(Boolean));
    resolved.dateOfBirth = this.resolveField(records.map(r => r.dateOfBirth).filter(Boolean));
    resolved.institution = this.resolveField(records.map(r => r.institution).filter(Boolean));
    resolved.programOrDegree = this.resolveField(records.map(r => r.programOrDegree).filter(Boolean));
    resolved.department = this.resolveField(records.map(r => r.department).filter(Boolean));
    resolved.enrollmentPeriod = this.resolveField(records.map(r => r.enrollmentPeriod).filter(Boolean));
    resolved.rollNumber = this.resolveField(records.map(r => r.rollNumber).filter(Boolean));

    return resolved;
  }

  /**
   * Resolve a single field from multiple candidates
   */
  private static resolveField<T>(candidates: FieldValue<T>[]): FieldValue<T> | undefined {
    if (candidates.length === 0) return undefined;
    if (candidates.length === 1) return candidates[0];

    // Group by normalized value
    const valueGroups = new Map<string, FieldValue<T>[]>();
    
    for (const candidate of candidates) {
      const normalizedValue = this.normalizeValue(candidate.value);
      if (!valueGroups.has(normalizedValue)) {
        valueGroups.set(normalizedValue, []);
      }
      valueGroups.get(normalizedValue)!.push(candidate);
    }

    // Score each group
    let bestGroup: FieldValue<T>[] | undefined;
    let bestScore = -1;

    for (const [_, group] of valueGroups) {
      const score = this.scoreGroup(group);
      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
      }
    }

    if (!bestGroup) return candidates[0];

    // Return the highest confidence candidate from the best group
    const best = bestGroup.reduce((prev, curr) => 
      curr.confidence > prev.confidence ? curr : prev
    );

    // Merge evidence from all candidates in the group
    const allEvidence: EvidenceRef[] = [];
    for (const candidate of bestGroup) {
      allEvidence.push(...candidate.evidence);
    }

    return {
      value: best.value,
      confidence: Math.min(1.0, best.confidence + (bestGroup.length - 1) * 0.1), // Boost for repetition
      evidence: allEvidence
    };
  }

  /**
   * Normalize value for comparison
   */
  private static normalizeValue(value: any): string {
    if (typeof value === 'string') {
      return value.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Score a group of field values
   * Higher score = more reliable
   */
  private static scoreGroup<T>(group: FieldValue<T>[]): number {
    const avgConfidence = group.reduce((sum, item) => sum + item.confidence, 0) / group.length;
    const repetitionBonus = Math.min(0.3, (group.length - 1) * 0.1);
    return avgConfidence + repetitionBonus;
  }
}
