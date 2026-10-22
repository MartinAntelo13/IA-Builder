import type { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];

// Columnas NOT NULL sin default que rellenan triggers BEFORE INSERT. El cliente
// no las envía, pero el tipo generado las exige. WithOptional las vuelve opcionales
// solo en las tablas afectadas; el resto del esquema sale sin cambios de Database.
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type OverrideInsert<N extends keyof Tables, K extends keyof Tables[N]['Insert']> = Omit<
  Tables[N],
  'Insert'
> & { Insert: WithOptional<Tables[N]['Insert'], K> };

export type AppDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Omit<Tables, 'comments' | 'requests' | 'attachments'> & {
      comments: OverrideInsert<'comments', 'author_id' | 'organization_id'>;
      requests: OverrideInsert<
        'requests',
        'currency_code' | 'organization_id' | 'request_seq' | 'requester_id'
      >;
      attachments: OverrideInsert<'attachments', 'organization_id' | 'uploaded_by'>;
    };
  };
};
