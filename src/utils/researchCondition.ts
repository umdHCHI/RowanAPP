/**
 * Utility function to determine the research condition for a user
 * based on their research group assignment.
 *
 * @param authOrProfile - Can be either:
 *   - The full MasterState object with character.userProfileData
 *   - An auth object with user.profile
 *   - A profile object directly
 * @returns "character" for condition A, "personality" for condition B, "character" as fallback
 */
export function getResearchCondition(authOrProfile: any): "character" | "personality" {
  // Debug: Log the wellness.homeData structure
  if (authOrProfile?.wellness?.homeData) {
    console.log('🔍 Inspecting wellness.homeData:', {
      hasUserProfile: !!authOrProfile.wellness.homeData.userProfile,
      userProfile: authOrProfile.wellness.homeData.userProfile,
      hasProfile: !!authOrProfile.wellness.homeData.userProfile?.profile,
      profile: authOrProfile.wellness.homeData.userProfile?.profile,
      hasResearchGroup: !!authOrProfile.wellness.homeData.userProfile?.profile?.research_group,
      researchGroup: authOrProfile.wellness.homeData.userProfile?.profile?.research_group
    });
  }

  // Try multiple paths to find the research condition
  let cond =
    // Path 1: auth.user.profile.research_group.condition (original)
    authOrProfile?.user?.profile?.research_group?.condition ||
    // Path 2: Direct profile object
    authOrProfile?.profile?.research_group?.condition ||
    // Path 3: character.userProfileData.profile.research_group.condition
    authOrProfile?.character?.userProfileData?.profile?.research_group?.condition ||
    // Path 4: wellness.homeData.userProfile.profile.research_group.condition
    authOrProfile?.wellness?.homeData?.userProfile?.profile?.research_group?.condition ||
    // Path 5: userProfileData directly
    authOrProfile?.userProfileData?.profile?.research_group?.condition;

  // FALLBACK: If no research_group found, use completion_type
  if (!cond) {
    const completionType =
      authOrProfile?.wellness?.homeData?.userProfile?.completion_type ||
      authOrProfile?.profile?.completion_type ||
      authOrProfile?.character?.userProfileData?.completion_type ||
      authOrProfile?.user?.profile?.completion_type;

    console.log('🔍 No research_group found, checking completion_type:', completionType);

    if (completionType === 'character') {
      cond = 'A';
    } else if (completionType === 'survey' || completionType === 'personality') {
      cond = 'B';
    }
  }

  console.log('🔍 getResearchCondition called:', {
    hasAuth: !!authOrProfile,
    paths: {
      path1_authUserProfile: !!authOrProfile?.user?.profile,
      path2_directProfile: !!authOrProfile?.profile,
      path3_characterUserProfileData: !!authOrProfile?.character?.userProfileData,
      path4_wellnessHomeData: !!authOrProfile?.wellness?.homeData,
      path5_userProfileData: !!authOrProfile?.userProfileData,
    },
    condition: cond,
    researchGroup: authOrProfile?.user?.profile?.research_group ||
                   authOrProfile?.profile?.research_group ||
                   authOrProfile?.character?.userProfileData?.profile?.research_group ||
                   authOrProfile?.wellness?.homeData?.userProfile?.profile?.research_group ||
                   authOrProfile?.userProfileData?.profile?.research_group
  });

  if (cond === "A") {
    console.log('✅ Research condition A detected → returning "character"');
    return "character";
  }
  if (cond === "B") {
    console.log('✅ Research condition B detected → returning "personality"');
    return "personality";
  }

  // fallback for admin/test users
  console.warn('⚠️ No valid research condition found, defaulting to "character"', {
    searchedObject: authOrProfile
  });
  return "character";
}
