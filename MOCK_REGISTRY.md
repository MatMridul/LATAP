# LATAP Mock Data Registry

**Purpose**: Track all mock data used in the application for complete removal before production.

## Mock Data Files

### frontend/mocks/dashboard.mock.ts
**Status**: ACTIVE  
**Created**: 2026-01-17  
**Purpose**: Dashboard UI development and component testing  

#### Mock Variables:
- `mockUserProfile` - User identity panel data
- `mockInstitutionOpportunities` - Institution opportunity insights  
- `mockApplicationStatuses` - User application status summary
- `mockActivityFeed` - Trust & activity feed items
- `mockPremiumInsights` - Premium feature previews

#### Components Using Mocks:
- `DashboardIdentityPanel` - Uses mockUserProfile
- `OpportunityInsights` - Uses mockInstitutionOpportunities  
- `ApplicationStatusSummary` - Uses mockApplicationStatuses
- `TrustActivityFeed` - Uses mockActivityFeed
- `PremiumValuePreview` - Uses mockPremiumInsights

#### Removal Conditions:
- [ ] Backend user profile API implemented
- [ ] Backend opportunity insights API implemented  
- [ ] Backend application status API implemented
- [ ] Backend activity feed API implemented
- [ ] Premium features backend implemented
- [ ] All dashboard components connected to real APIs
- [ ] UI testing completed with real data

## Cleanup Checklist

Before production deployment:

1. [ ] Remove all files in `frontend/mocks/` directory
2. [ ] Remove all mock imports from components
3. [ ] Replace mock data with real API calls
4. [ ] Update component props to use real data types
5. [ ] Test all dashboard functionality with real backend
6. [ ] Remove this registry file

## Notes

- All mock data includes metadata for tracking (id, type, description, used_in_component)
- Mock data follows real data structure for seamless replacement
- No production logic should depend on mock data
- Mock data is clearly labeled and isolated
