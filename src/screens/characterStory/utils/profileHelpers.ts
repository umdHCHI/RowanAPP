export const selectProfileAndCharacter = (homeData?: any) => {
  // Single source of truth: userProfile contains everything
  const profile = homeData?.userProfile ?? null;
  const backendCharacter = profile?.character ?? null;

  console.log('🔍 [CharacterHomeScreen.selectProfileAndCharacter]', {
    hasHomeData: !!homeData,
    hasProfile: !!profile,
    hasCharacter: !!backendCharacter,
    characterName: backendCharacter?.name,
    characterId: backendCharacter?.id
  });

  return { profile, backendCharacter };
};