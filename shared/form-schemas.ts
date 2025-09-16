// Schema centralizado para todos os formulários do sistema
// Este arquivo define a estrutura unificada para geração de PDFs

export type FieldType = 
  | 'radio' // Sim/Não/N/A
  | 'input' // text, number, date
  | 'select' // dropdown
  | 'textarea' // multi-line text
  | 'checkbox' // boolean
  | 'signature' // assinatura digital
  | 'section-header' // título de seção
  | 'subsection-header'; // título de subseção

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[]; // Para select e radio
  inputType?: 'text' | 'number' | 'date' | 'email' | 'tel'; // Para input
  includeField?: boolean; // Para radio com campo adicional (valor numérico)
  fieldLabel?: string; // Label do campo adicional
  fieldType?: 'text' | 'number' | 'date';
  rows?: number; // Para textarea
  help?: string; // Texto de ajuda
  unit?: string; // Unidade de medida
  step?: number; // Para inputs numéricos
}

export interface FormSection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  fields: FormField[];
  requiredFrequencies?: string[]; // Frequências que tornam esta seção obrigatória
  conditionalDisplay?: boolean; // Se a seção deve ser exibida condicionalmente
}

export interface FormSchema {
  id: string;
  title: string;
  description: string;
  version: string;
  sections: FormSection[];
  frequencies?: string[]; // Frequências disponíveis para este formulário
  estimatedTime?: string;
}

// Schema para Wet Sprinkler System
export const WET_SPRINKLER_SCHEMA: FormSchema = {
  id: "wet-sprinkler",
  title: "Sistema de Sprinklers de Tubo Molhado (Wet Pipe)",
  description: "Inspeção, Teste e Manutenção conforme NFPA 25 - Versão Integral",
  version: "1.0.0",
  frequencies: ["Diária", "Semanal", "Mensal", "Trimestral", "Anual", "5 Anos", "Testes"],
  estimatedTime: "15-20 min",
  sections: [
    {
      id: "general",
      title: "Informações Gerais",
      icon: "📋",
      fields: [
        {
          id: "propertyName",
          type: "input",
          label: "Nome da Propriedade",
          inputType: "text",
          required: true,
          placeholder: "Ex: Centro Empresarial ABC"
        },
        {
          id: "propertyAddress", 
          type: "input",
          label: "Endereço da Propriedade",
          inputType: "text",
          required: true,
          placeholder: "Endereço completo"
        },
        {
          id: "propertyPhone",
          type: "input",
          label: "Telefone",
          inputType: "tel",
          placeholder: "(11) 99999-9999"
        },
        {
          id: "inspector",
          type: "input", 
          label: "Inspetor",
          inputType: "text",
          required: true,
          placeholder: "Nome completo e credenciais"
        },
        {
          id: "contractNumber",
          type: "input",
          label: "Número do Contrato",
          inputType: "text",
          placeholder: "Número do contrato"
        },
        {
          id: "date",
          type: "input",
          label: "Data da Inspeção",
          inputType: "date",
          required: true
        },
        {
          id: "frequency",
          type: "select",
          label: "Frequência da Inspeção",
          required: true,
          options: [
            { value: "diaria", label: "Diária" },
            { value: "semanal", label: "Semanal" },
            { value: "mensal", label: "Mensal" },
            { value: "trimestral", label: "Trimestral" },
            { value: "anual", label: "Anual" },
            { value: "5anos", label: "5 Anos" },
            { value: "testes", label: "Testes" }
          ]
        }
      ]
    },
    {
      id: "daily",
      title: "Inspeções Diárias",
      icon: "📅",
      description: "Verificações diárias de alarmes e monitoramento",
      requiredFrequencies: ["diaria"],
      conditionalDisplay: true,
      fields: [
        {
          id: "daily_alarm_receipt",
          type: "radio",
          label: "Alarmes sendo recebidos adequadamente na estação de supervisão?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "daily_water_flow_alarms",
          type: "radio", 
          label: "Alarmes de fluxo de água sendo recebidos na estação de supervisão?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "daily_supervisory_alarms",
          type: "radio",
          label: "Sinais de supervisão sendo recebidos na estação de supervisão?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        }
      ]
    },
    {
      id: "weekly",
      title: "Inspeções Semanais",
      icon: "📊",
      description: "Verificações semanais de válvulas de controle e dispositivos de fluxo reverso",
      requiredFrequencies: ["semanal"],
      conditionalDisplay: true,
      fields: [
        {
          id: "weekly_section_header_backflow",
          type: "section-header",
          label: "Fluxo de Retorno (Backflow)"
        },
        {
          id: "weekly_isolation_valves",
          type: "radio",
          label: "Válvulas de isolamento estão em posição aberta e travadas ou supervisionadas?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "weekly_rpa_rpda",
          type: "radio",
          label: "RPA e RPDA – válvula de alívio de detecção diferencial operando corretamente?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "weekly_section_header_pressure_regulator",
          type: "section-header", 
          label: "Dispositivo Regulador de Pressão Mestre"
        },
        {
          id: "weekly_downstream_pressures",
          type: "radio",
          label: "As pressões a jusante (downstream) estão de acordo com os critérios de projeto?",
          includeField: true,
          fieldLabel: "Valor (psi)",
          fieldType: "number",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "weekly_supply_pressure",
          type: "radio",
          label: "A pressão de abastecimento está de acordo com os critérios de projeto?",
          includeField: true,
          fieldLabel: "Valor (psi)",
          fieldType: "number",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        }
      ]
    },
    {
      id: "monthly", 
      title: "Inspeções Mensais",
      icon: "📈",
      description: "Inspeções mensais de válvulas e componentes do sistema",
      requiredFrequencies: ["mensal"],
      conditionalDisplay: true,
      fields: [
        {
          id: "monthly_section_header_water_supply",
          type: "section-header",
          label: "Abastecimento de Água"
        },
        {
          id: "monthly_control_valves_open",
          type: "radio",
          label: "Válvulas de controle abertas e em condições de serviço?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "monthly_valve_room_conditions",
          type: "radio",
          label: "Casa de válvulas aquecida adequadamente (mín. 40°F/4°C)?",
          includeField: true,
          fieldLabel: "Temperatura (°F)",
          fieldType: "number",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        }
      ]
    },
    {
      id: "signatures",
      title: "Assinaturas",
      icon: "✍️",
      fields: [
        {
          id: "inspectorSignature",
          type: "signature",
          label: "Assinatura do Inspetor",
          required: true
        },
        {
          id: "clientSignature",
          type: "signature", 
          label: "Assinatura do Cliente",
          required: true
        }
      ]
    }
  ]
};

// Schema para Foam Water System
export const FOAM_WATER_SCHEMA: FormSchema = {
  id: "foam-water",
  title: "Sistema de Sprinklers de Espuma-Água",
  description: "Sistemas que combinam água com agente formador de espuma para proteção especial",
  version: "1.0.0",
  estimatedTime: "20-25 min",
  sections: [
    {
      id: "general",
      title: "Informações Gerais",
      icon: "📋",
      fields: [
        {
          id: "facilityName",
          type: "input",
          label: "Nome da Instalação",
          inputType: "text",
          required: true,
          placeholder: "Nome da instalação"
        },
        {
          id: "systemLocation",
          type: "input",
          label: "Localização do Sistema",
          inputType: "text",
          required: true,
          placeholder: "Ex: Hangar de Aeronaves, Área de Combustíveis"
        },
        {
          id: "inspectionDate",
          type: "input",
          label: "Data da Inspeção",
          inputType: "date",
          required: true
        },
        {
          id: "inspectorName",
          type: "input",
          label: "Nome do Inspetor",
          inputType: "text",
          required: true,
          placeholder: "Nome completo e credenciais"
        }
      ]
    },
    {
      id: "foam-system",
      title: "Sistema de Concentrado de Espuma",
      icon: "🧪",
      fields: [
        {
          id: "foamConcentrateType",
          type: "select",
          label: "Tipo de Concentrado de Espuma",
          options: [
            { value: "afff", label: "AFFF (Aqueous Film Forming Foam)" },
            { value: "ar-afff", label: "AR-AFFF (Alcohol Resistant)" },
            { value: "protein", label: "Protein Foam" },
            { value: "fluoroprotein", label: "Fluoroprotein Foam" },
            { value: "high-expansion", label: "High Expansion Foam" }
          ]
        },
        {
          id: "foamConcentrateLevel", 
          type: "input",
          label: "Nível do Concentrado (%)",
          inputType: "number",
          placeholder: "Ex: 85",
          help: "Nível no tanque de armazenamento"
        },
        {
          id: "foamConcentrateCondition",
          type: "select",
          label: "Condição do Concentrado",
          options: [
            { value: "excellent", label: "Excelente" },
            { value: "good", label: "Boa" },
            { value: "fair", label: "Regular" },
            { value: "poor", label: "Ruim" },
            { value: "expired", label: "Vencido" }
          ]
        }
      ]
    },
    {
      id: "deficiencies",
      title: "Deficiências e Ações Corretivas",
      icon: "⚠️",
      fields: [
        {
          id: "deficienciesFound",
          type: "textarea",
          label: "Deficiências Encontradas",
          rows: 4,
          placeholder: "Descreva quaisquer deficiências encontradas durante a inspeção..."
        },
        {
          id: "correctiveActions",
          type: "textarea",
          label: "Ações Corretivas Necessárias",
          rows: 4,
          placeholder: "Descreva as ações corretivas necessárias para resolver as deficiências..."
        }
      ]
    },
    {
      id: "status",
      title: "Status e Conclusões",
      icon: "✅",
      fields: [
        {
          id: "systemOperational",
          type: "checkbox",
          label: "Sistema Operacional"
        },
        {
          id: "inspectionPassed",
          type: "checkbox", 
          label: "Inspeção Aprovada"
        },
        {
          id: "additionalNotes",
          type: "textarea",
          label: "Observações Adicionais",
          rows: 3,
          placeholder: "Observações adicionais sobre a inspeção..."
        }
      ]
    }
  ]
};

// Schema para Weekly Pump Form
export const WEEKLY_PUMP_SCHEMA: FormSchema = {
  id: "weekly-pump",
  title: "Inspeção Semanal de Bomba",
  description: "Inspeção semanal de sistemas de bomba conforme NFPA 25",
  version: "1.0.0",
  estimatedTime: "10-15 min",
  sections: [
    {
      id: "general",
      title: "Informações Gerais",
      icon: "📋",
      fields: [
        {
          id: "propertyName",
          type: "input",
          label: "Nome da Propriedade",
          inputType: "text",
          required: true
        },
        {
          id: "propertyAddress",
          type: "input",
          label: "Endereço da Propriedade", 
          inputType: "text",
          required: true
        },
        {
          id: "inspector",
          type: "input",
          label: "Inspetor",
          inputType: "text",
          required: true
        },
        {
          id: "date",
          type: "input",
          label: "Data da Inspeção",
          inputType: "date",
          required: true
        }
      ]
    },
    {
      id: "pumphouse",
      title: "Casa de Bombas",
      icon: "🏠",
      fields: [
        {
          id: "pumphouse_temperature",
          type: "radio",
          label: "Casa de bomba adequadamente aquecida (mín. 40°F/4°C)?",
          includeField: true,
          fieldLabel: "Temperatura (°F)",
          fieldType: "number",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "pumphouse_ventilation",
          type: "radio",
          label: "Ventilação adequada presente?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        }
      ]
    },
    {
      id: "pumpsystems",
      title: "Sistemas de Bomba",
      icon: "⚙️",
      fields: [
        {
          id: "pump_condition",
          type: "radio",
          label: "Bomba livre de danos físicos ou vazamentos incomuns?",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        },
        {
          id: "suction_pressure",
          type: "radio",
          label: "Pressão de sucção normal?",
          includeField: true,
          fieldLabel: "Valor (psi)",
          fieldType: "number",
          options: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "na", label: "N/A" }
          ]
        }
      ]
    }
  ]
};

// Mapa de todos os schemas
export const FORM_SCHEMAS: Record<string, FormSchema> = {
  "wet-sprinkler": WET_SPRINKLER_SCHEMA,
  "foam-water": FOAM_WATER_SCHEMA,
  "weekly-pump": WEEKLY_PUMP_SCHEMA,
  // TODO: Adicionar outros schemas conforme necessário
};

// Utilitários para trabalhar com schemas
export function getFormSchema(formId: string): FormSchema | undefined {
  return FORM_SCHEMAS[formId];
}

export function getAllFormSchemas(): FormSchema[] {
  return Object.values(FORM_SCHEMAS);
}

export function validateFormData(formId: string, formData: Record<string, any>): { isValid: boolean; errors: string[] } {
  const schema = getFormSchema(formId);
  if (!schema) {
    return { isValid: false, errors: [`Schema não encontrado para o formulário: ${formId}`] };
  }

  const errors: string[] = [];

  // Validar campos obrigatórios
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        errors.push(`Campo obrigatório não preenchido: ${field.label}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}