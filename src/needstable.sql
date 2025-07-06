create table public.needs (
  id uuid not null default extensions.uuid_generate_v4 (),
  individual_id uuid not null,
  category text not null,
  description text not null,
  status text not null,
  priority text not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  created_by uuid null,
  constraint needs_pkey primary key (id),
  constraint needs_created_by_fkey foreign KEY (created_by) references users (id),
  constraint needs_individual_id_fkey foreign KEY (individual_id) references individuals (id) on delete CASCADE,
  constraint needs_category_check check (
    (
      category = any (
        array[
          'medical'::text,
          'financial'::text,
          'food'::text,
          'shelter'::text,
          'clothing'::text,
          'education'::text,
          'employment'::text,
          'transportation'::text,
          'other'::text
        ]
      )
    )
  ),
  constraint needs_priority_check check (
    (
      priority = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'urgent'::text
        ]
      )
    )
  ),
  constraint needs_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'in_progress'::text,
          'completed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_needs_category on public.needs using btree (category) TABLESPACE pg_default;

create index IF not exists idx_needs_created_by on public.needs using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_needs_individual on public.needs using btree (individual_id) TABLESPACE pg_default;

create index IF not exists idx_needs_individual_id on public.needs using btree (individual_id) TABLESPACE pg_default;

create index IF not exists idx_needs_priority on public.needs using btree (priority) TABLESPACE pg_default;

create index IF not exists idx_needs_status on public.needs using btree (status) TABLESPACE pg_default;

create trigger update_needs_updated_at BEFORE
update on needs for EACH row
execute FUNCTION update_updated_at_column ();