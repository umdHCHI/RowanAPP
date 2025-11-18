import { useState } from 'react';

interface AttributeData {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  icon?: string;
}

export const useAttributeModal = () => {
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeData | null>(null);

  const openAttributeModal = (attribute: AttributeData) => {
    setSelectedAttribute(attribute);
    setShowAttributeModal(true);
  };

  const closeAttributeModal = () => {
    setShowAttributeModal(false);
    setSelectedAttribute(null);
  };

  return {
    showAttributeModal,
    selectedAttribute,
    openAttributeModal,
    closeAttributeModal
  };
};