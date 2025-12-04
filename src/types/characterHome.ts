

export interface ProfileTabProps {
    homeStyles: any;
    homeTheme: any;
    wellness: any;
    equipment: any;
    character: any;
    setShowEquipmentModal: (show: boolean) => void;
    openAttributeModal: (attr: any) => void;
    wellnessStatsForDisplay: any[];
    auth: any;
    params: any;
    isLoadingCharacterData: boolean;
  }