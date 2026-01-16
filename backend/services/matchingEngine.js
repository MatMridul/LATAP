// Deterministic Matching Engine
// NO AI - Rule-based scoring only

class MatchingEngine {
  /**
   * Calculate match score between candidate and opportunity
   * Returns score 0-100 with detailed breakdown
   */
  static calculateMatch(talentProfile, opportunity) {
    const breakdown = {
      skills: 0,
      experience: 0,
      education: 0,
      location: 0,
      jobType: 0,
      total: 0
    };

    // Skills matching (40 points max)
    if (opportunity.required_skills && opportunity.required_skills.length > 0 && talentProfile.skills) {
      const requiredSkills = opportunity.required_skills.map(s => s.toLowerCase());
      const candidateSkills = talentProfile.skills.map(s => s.toLowerCase());
      
      const matchedSkills = requiredSkills.filter(skill => 
        candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
      );
      
      breakdown.skills = Math.round((matchedSkills.length / requiredSkills.length) * 40);
    } else {
      breakdown.skills = 20; // No requirements = partial credit
    }

    // Experience matching (25 points max)
    if (opportunity.min_experience !== null || opportunity.max_experience !== null) {
      const candidateExp = talentProfile.years_of_experience || 0;
      const minExp = opportunity.min_experience || 0;
      const maxExp = opportunity.max_experience || 999;

      if (candidateExp >= minExp && candidateExp <= maxExp) {
        breakdown.experience = 25; // Perfect match
      } else if (candidateExp < minExp) {
        // Under-qualified: scale down
        const diff = minExp - candidateExp;
        breakdown.experience = Math.max(0, 25 - (diff * 5));
      } else {
        // Over-qualified: slight penalty
        breakdown.experience = 20;
      }
    } else {
      breakdown.experience = 15; // No requirements = partial credit
    }

    // Education matching (15 points max)
    if (opportunity.required_degree) {
      const degreeHierarchy = {
        'high school': 1,
        'associate': 2,
        'bachelor': 3,
        'master': 4,
        'phd': 5,
        'doctorate': 5
      };

      const requiredLevel = this.getDegreeLevel(opportunity.required_degree, degreeHierarchy);
      const candidateLevel = this.getDegreeLevel(talentProfile.highest_degree, degreeHierarchy);

      if (candidateLevel >= requiredLevel) {
        breakdown.education = 15;
      } else {
        breakdown.education = Math.max(0, 15 - ((requiredLevel - candidateLevel) * 5));
      }
    } else {
      breakdown.education = 10; // No requirements = partial credit
    }

    // Location matching (10 points max)
    if (opportunity.is_remote || talentProfile.remote_preference === 'remote') {
      breakdown.location = 10; // Remote = always match
    } else if (opportunity.location && talentProfile.preferred_locations) {
      const oppLocation = opportunity.location.toLowerCase();
      const hasMatch = talentProfile.preferred_locations.some(loc => 
        loc.toLowerCase().includes(oppLocation) || oppLocation.includes(loc.toLowerCase())
      );
      breakdown.location = hasMatch ? 10 : 3;
    } else {
      breakdown.location = 5; // Unknown = neutral
    }

    // Job type matching (10 points max)
    if (opportunity.job_type && talentProfile.job_types) {
      const hasMatch = talentProfile.job_types.includes(opportunity.job_type);
      breakdown.jobType = hasMatch ? 10 : 3;
    } else {
      breakdown.jobType = 5; // Unknown = neutral
    }

    // Calculate total
    breakdown.total = breakdown.skills + breakdown.experience + breakdown.education + 
                     breakdown.location + breakdown.jobType;

    return {
      score: breakdown.total,
      breakdown
    };
  }

  static getDegreeLevel(degree, hierarchy) {
    if (!degree) return 0;
    const degreeLower = degree.toLowerCase();
    for (const [key, value] of Object.entries(hierarchy)) {
      if (degreeLower.includes(key)) return value;
    }
    return 0;
  }

  /**
   * Check if candidate meets minimum requirements
   */
  static meetsMinimumRequirements(talentProfile, opportunity) {
    // Experience requirement
    if (opportunity.min_experience !== null) {
      const candidateExp = talentProfile.years_of_experience || 0;
      if (candidateExp < opportunity.min_experience) {
        return { meets: false, reason: 'Insufficient experience' };
      }
    }

    // Education requirement
    if (opportunity.required_degree) {
      const degreeHierarchy = {
        'high school': 1,
        'associate': 2,
        'bachelor': 3,
        'master': 4,
        'phd': 5
      };

      const requiredLevel = this.getDegreeLevel(opportunity.required_degree, degreeHierarchy);
      const candidateLevel = this.getDegreeLevel(talentProfile.highest_degree, degreeHierarchy);

      if (candidateLevel < requiredLevel) {
        return { meets: false, reason: 'Education requirement not met' };
      }
    }

    return { meets: true };
  }
}

module.exports = MatchingEngine;
