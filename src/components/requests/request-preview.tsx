// 'use client' - recibe props reactivos del formulario padre y re-renderiza en vivo
'use client';

import { FileText, Info, AlertCircle } from 'lucide-react';
import { PRIORITY_STYLES } from '@/constants';
import type { Database } from '@/types/database.types';

type PriorityLevel = Database['public']['Enums']['priority_level'];

interface RequestPreviewProps {
  title: string;
  typeName?: string;
  priority: PriorityLevel;
  amount: number | null | undefined;
  costCenterName?: string;
  currencySymbol: string;
}

function formatAmount(amount: number, symbol: string): string {
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function RequestPreview({
  title,
  typeName,
  priority,
  amount,
  costCenterName,
  currencySymbol,
}: RequestPreviewProps) {
  const priorityLabel = PRIORITY_STYLES[priority]?.label ?? priority;

  return (
    <aside className="summary-card">
      <div className="summary-title">
        <div>
          <p className="eyebrow">VISTA PREVIA</p>
          <h2>Resumen</h2>
        </div>
        <span className="summary-status">Borrador</span>
      </div>

      <div className="summary-preview">
        <div className="summary-icon">
          <FileText size={17} />
        </div>
        <div>
          <strong>{title || 'Sin título todavía'}</strong>
          <span>
            {typeName ?? '—'} · {priorityLabel}
          </span>
        </div>
      </div>

      <dl className="summary-fields">
        <div>
          <dt>Tipo de solicitud</dt>
          <dd>{typeName ?? '—'}</dd>
        </div>
        <div>
          <dt>Importe</dt>
          <dd>
            {amount != null && !isNaN(amount)
              ? formatAmount(amount, currencySymbol)
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Centro de coste</dt>
          <dd>{costCenterName ?? '—'}</dd>
        </div>
      </dl>

      <div className="help-note">
        <Info size={16} />
        <p>
          Tu solicitud pasará al primer paso de aprobación configurado para
          este tipo de flujo
        </p>
      </div>

      <div className="summary-tip">
        <AlertCircle size={15} />
        <span>Revisa los datos antes de enviarla</span>
      </div>
    </aside>
  );
}
