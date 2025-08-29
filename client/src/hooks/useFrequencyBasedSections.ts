import { useMemo } from 'react';

type Section = {
  id: string;
  title: string;
  icon: string;
};

type FrequencyConfig = {
  visibleSections: string[];
  cumulativeLogic: boolean;
};

// Mapeamento das frequências e suas seções correspondentes
const FREQUENCY_MAPPING: Record<string, FrequencyConfig> = {
  diaria: {
    visibleSections: ['general', 'daily'],
    cumulativeLogic: true
  },
  semanal: {
    visibleSections: ['general', 'daily', 'weekly'],
    cumulativeLogic: true
  },
  mensal: {
    visibleSections: ['general', 'daily', 'weekly', 'monthly'],
    cumulativeLogic: true
  },
  trimestral: {
    visibleSections: ['general', 'daily', 'weekly', 'monthly', 'quarterly'],
    cumulativeLogic: true
  },
  anual: {
    visibleSections: ['general', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'tests'],
    cumulativeLogic: true
  },
  '5anos': {
    visibleSections: ['general', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'fiveyears', 'tests'],
    cumulativeLogic: true
  }
};

export function useFrequencyBasedSections(
  allSections: Section[],
  selectedFrequency: string | undefined,
  currentSection: string,
  setCurrentSection: (section: string) => void
) {
  // Calcula as seções visíveis baseado na frequência selecionada
  const visibleSections = useMemo(() => {
    if (!selectedFrequency || !FREQUENCY_MAPPING[selectedFrequency]) {
      return allSections; // Se não há frequência selecionada, mostra todas
    }

    const config = FREQUENCY_MAPPING[selectedFrequency];
    return allSections.filter(section => 
      config.visibleSections.includes(section.id)
    );
  }, [allSections, selectedFrequency]);

  // Calcula as seções habilitadas (para navegação)
  const enabledSectionIds = useMemo(() => {
    return new Set(visibleSections.map(section => section.id));
  }, [visibleSections]);

  // Ajusta a seção atual se ela se tornou inválida
  const adjustedCurrentSection = useMemo(() => {
    if (enabledSectionIds.has(currentSection)) {
      return currentSection;
    }
    // Se a seção atual não é mais válida, vai para a primeira seção disponível
    return visibleSections.length > 0 ? visibleSections[0].id : 'general';
  }, [currentSection, enabledSectionIds, visibleSections]);

  // Auto-ajustar a seção atual quando necessário
  if (adjustedCurrentSection !== currentSection) {
    setCurrentSection(adjustedCurrentSection);
  }

  // Função para verificar se uma seção está habilitada
  const isSectionEnabled = (sectionId: string): boolean => {
    return enabledSectionIds.has(sectionId);
  };

  // Função para verificar se uma seção está visível
  const isSectionVisible = (sectionId: string): boolean => {
    return enabledSectionIds.has(sectionId);
  };

  // Calcula se há alguma restrição ativa
  const hasFrequencyRestriction = Boolean(selectedFrequency && FREQUENCY_MAPPING[selectedFrequency]);

  return {
    visibleSections,
    enabledSectionIds,
    currentSection: adjustedCurrentSection,
    isSectionEnabled,
    isSectionVisible,
    hasFrequencyRestriction
  };
}

// Hook auxiliar para obter informações sobre uma frequência específica
export function useFrequencyInfo(frequency: string | undefined) {
  return useMemo(() => {
    if (!frequency || !FREQUENCY_MAPPING[frequency]) {
      return null;
    }

    const config = FREQUENCY_MAPPING[frequency];
    return {
      frequency,
      includedSections: config.visibleSections,
      description: getFrequencyDescription(frequency)
    };
  }, [frequency]);
}

function getFrequencyDescription(frequency: string): string {
  const descriptions: Record<string, string> = {
    diaria: 'Inspeções diárias básicas (aplicáveis durante clima frio)',
    semanal: 'Inclui inspeções diárias + verificações semanais de válvulas e sistemas',
    mensal: 'Inclui inspeções semanais + verificações mensais de equipamentos',
    trimestral: 'Inclui inspeções mensais + verificações trimestrais especializadas',
    anual: 'Inspeção completa incluindo testes anuais e verificações especializadas',
    '5anos': 'Inspeção integral de 5 anos com todos os testes e verificações'
  };

  return descriptions[frequency] || 'Frequência personalizada';
}