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

// Função para mapear frequências baseado nas seções disponíveis
function getFrequencyMapping(availableSections: string[]): Record<string, FrequencyConfig> {
  const hasDaily = availableSections.includes('daily');
  const hasWeekly = availableSections.includes('weekly');
  const hasMonthly = availableSections.includes('monthly');
  const hasQuarterly = availableSections.includes('quarterly');
  const hasSemiannual = availableSections.includes('semiannual');
  const hasAnnual = availableSections.includes('annual');
  const hasFiveyears = availableSections.includes('fiveyears');
  const hasTests = availableSections.includes('tests');

  const mapping: Record<string, FrequencyConfig> = {};

  // Diária - mostra apenas daily (se disponível) ou weekly como fallback
  if (hasDaily) {
    mapping.diaria = {
      visibleSections: ['general', 'daily', 'signatures'],
      cumulativeLogic: false
    };
  } else if (hasWeekly) {
    mapping.diaria = {
      visibleSections: ['general', 'weekly', 'signatures'],
      cumulativeLogic: false
    };
  }

  // Semanal - mostra até weekly
  if (hasWeekly) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    sections.push('weekly', 'signatures');
    mapping.semanal = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  // Mensal - mostra até monthly
  if (hasMonthly) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    if (hasWeekly) sections.push('weekly');
    sections.push('monthly', 'signatures');
    mapping.mensal = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  // Trimestral - mostra até quarterly
  if (hasQuarterly) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    if (hasWeekly) sections.push('weekly');
    if (hasMonthly) sections.push('monthly');
    sections.push('quarterly', 'signatures');
    mapping.trimestral = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  // Semestral - para formulários que têm esta seção
  if (hasSemiannual) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    if (hasWeekly) sections.push('weekly');
    if (hasMonthly) sections.push('monthly');
    if (hasQuarterly) sections.push('quarterly');
    sections.push('semiannual', 'signatures');
    mapping.semestral = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  // Anual - mostra até annual (inclui tests se disponível)
  if (hasAnnual) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    if (hasWeekly) sections.push('weekly');
    if (hasMonthly) sections.push('monthly');
    if (hasQuarterly) sections.push('quarterly');
    if (hasSemiannual) sections.push('semiannual');
    sections.push('annual');
    if (hasTests) sections.push('tests');
    sections.push('signatures');
    mapping.anual = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  // 5 Anos - mostra todas as seções disponíveis
  if (hasFiveyears) {
    const sections = ['general'];
    if (hasDaily) sections.push('daily');
    if (hasWeekly) sections.push('weekly');
    if (hasMonthly) sections.push('monthly');
    if (hasQuarterly) sections.push('quarterly');
    if (hasSemiannual) sections.push('semiannual');
    if (hasAnnual) sections.push('annual');
    sections.push('fiveyears');
    if (hasTests) sections.push('tests');
    sections.push('signatures');
    mapping['5anos'] = {
      visibleSections: sections,
      cumulativeLogic: false
    };
  }

  return mapping;
}

export function useFrequencyBasedSections(
  allSections: Section[],
  selectedFrequency: string | undefined,
  currentSection: string,
  setCurrentSection: (section: string) => void
) {
  // Gera mapeamento de frequência baseado nas seções disponíveis
  const frequencyMapping = useMemo(() => {
    const availableSectionIds = allSections.map(section => section.id);
    return getFrequencyMapping(availableSectionIds);
  }, [allSections]);

  // Calcula as seções visíveis baseado na frequência selecionada
  const visibleSections = useMemo(() => {
    if (!selectedFrequency || !frequencyMapping[selectedFrequency]) {
      return allSections; // Se não há frequência selecionada, mostra todas
    }

    const config = frequencyMapping[selectedFrequency];
    return allSections.filter(section => 
      config.visibleSections.includes(section.id)
    );
  }, [allSections, selectedFrequency, frequencyMapping]);

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
  const hasFrequencyRestriction = Boolean(selectedFrequency && frequencyMapping[selectedFrequency]);

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
export function useFrequencyInfo(frequency: string | undefined, allSections?: Section[]) {
  return useMemo(() => {
    if (!frequency) {
      return null;
    }

    // Se temos seções disponíveis, usar mapeamento dinâmico
    let config = null;
    if (allSections) {
      const availableSectionIds = allSections.map(section => section.id);
      const frequencyMapping = getFrequencyMapping(availableSectionIds);
      config = frequencyMapping[frequency];
    }

    return {
      frequency,
      includedSections: config?.visibleSections || [],
      description: getFrequencyDescription(frequency)
    };
  }, [frequency, allSections]);
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